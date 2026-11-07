const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");

const { OllamaDiscovery } = require("../src/core/ollama-discovery");

test.describe("Limitless Claude 8.2 - Ollama Auto-Discovery Engine Suite", () => {

  test.it("Offline Host Probe - handles offline Ollama gracefully with zero errors", async () => {
    // Port 11439 is not running
    const engine = new OllamaDiscovery({ host: "http://127.0.0.1:11439", timeoutMs: 300 });
    const result = await engine.probe();

    assert.equal(result.online, false);
    assert.equal(result.modelCount, 0);
    assert.deepEqual(result.models, []);
    assert.ok(result.error);

    const inventory = engine.toModelInventory(result);
    assert.deepEqual(inventory, []);
  });

  test.it("Online Host Probe - discovers local models and generates valid inventory entries", async () => {
    // Spin up an ephemeral test server mimicking Ollama's /api/tags
    const mockServer = http.createServer((req, res) => {
      if (req.url === "/api/tags") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          models: [
            { name: "qwen2.5-coder:32b", model: "qwen2.5-coder:32b", size: 19800000000, digest: "sha256:abc123" },
            { name: "deepseek-r1:14b", model: "deepseek-r1:14b", size: 9000000000, digest: "sha256:def456" },
            { name: "llama3.3:latest", model: "llama3.3:latest", size: 42000000000, digest: "sha256:789ghi" }
          ]
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => mockServer.listen(0, "127.0.0.1", resolve));
    const port = mockServer.address().port;

    try {
      const engine = new OllamaDiscovery({ host: `http://127.0.0.1:${port}`, timeoutMs: 1000 });
      const result = await engine.probe();

      assert.equal(result.online, true);
      assert.equal(result.modelCount, 3);
      assert.equal(result.models[0].name, "qwen2.5-coder:32b");

      const inventory = engine.toModelInventory(result);
      assert.equal(inventory.length, 3);

      const qwen = inventory.find(m => m.id === "ollama/qwen2.5-coder:32b");
      assert.ok(qwen);
      assert.equal(qwen.provider, "ollama");
      assert.equal(qwen.billing, "free");
      assert.equal(qwen.pricing, "free");
      assert.equal(qwen.tools, true);

      const r1 = inventory.find(m => m.id === "ollama/deepseek-r1:14b");
      assert.ok(r1);
      assert.equal(r1.reasoning, true);
    } finally {
      await new Promise((resolve) => mockServer.close(resolve));
    }
  });

});
