const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const os = require("os");
const http = require("http");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const { openDatabase } = require("../src/omniroute/db");

test.describe("Model and Provider Discovery Script", () => {
  const tmpDir = path.join(os.tmpdir(), "disc-test-" + Date.now());
  const dbPath = path.join(tmpDir, "storage.sqlite");
  const configDir = path.join(tmpDir, "config");
  let mockServer;
  let mockPort;

  test.before(async () => {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.mkdirSync(configDir, { recursive: true });

    const db = openDatabase(dbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, is_active INTEGER, created_at DATETIME, last_used_at DATETIME);
      INSERT INTO api_keys VALUES ('disc-key', 1, datetime('now'), datetime('now'));

      CREATE TABLE provider_connections (provider TEXT PRIMARY KEY, is_active INTEGER);
      INSERT INTO provider_connections VALUES ('github', 1);
      INSERT INTO provider_connections VALUES ('groq', 1);
      INSERT INTO provider_connections VALUES ('openrouter', 0);
    `);
    db.close();

    mockServer = http.createServer((req, res) => {
      if (req.url === "/v1/models") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          data: [
            { id: "github/gpt-4o-mini", context_length: 128000 },
            { id: "openrouter/z-ai/glm-5.2:free", context_length: 64000 }
          ]
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => mockServer.listen(0, "127.0.0.1", resolve));
    mockPort = mockServer.address().port;
  });

  test.after(async () => {
    if (mockServer) {
      await new Promise((resolve) => mockServer.close(resolve));
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test.it("should discover providers and live models successfully when gateway is active", async () => {
    await execAsync("node scripts/discover.js", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: tmpDir,
        LIMITLESS_CONFIG_DIR: configDir,
        OMNIROUTE_BASE_URL: `http://127.0.0.1:${mockPort}`
      }
    });

    const provPath = path.join(configDir, "provider-inventory.json");
    assert.strictEqual(fs.existsSync(provPath), true);

    const inventory = JSON.parse(fs.readFileSync(provPath, "utf8"));
    assert.strictEqual(inventory.length, 3);

    const github = inventory.find(i => i.provider === "github");
    assert.ok(github);
    assert.strictEqual(github.active, true);
    assert.ok(github.last_scanned, "Must use last_scanned metadata instead of last_verified");
    assert.strictEqual(github.authentication_state, "unverified");

    const openrouter = inventory.find(i => i.provider === "openrouter");
    assert.ok(openrouter);
    assert.strictEqual(openrouter.active, false);

    const modelPath = path.join(configDir, "model-inventory.json");
    assert.strictEqual(fs.existsSync(modelPath), true);
    const models = JSON.parse(fs.readFileSync(modelPath, "utf8"));
    assert.strictEqual(models.length, 2);
  });

  test.it("should preserve provider inventory but exit with nonzero code if live gateway HTTP request fails", async () => {
    const failConfigDir = path.join(tmpDir, "fail-config-http");
    fs.mkdirSync(failConfigDir, { recursive: true });

    try {
      await execAsync("node scripts/discover.js", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: tmpDir,
          LIMITLESS_CONFIG_DIR: failConfigDir,
          OMNIROUTE_BASE_URL: "http://127.0.0.1:59999"
        }
      });
      assert.fail("Should exit with nonzero code when live HTTP fetch fails");
    } catch (e) {
      assert.strictEqual(e.code !== 0, true, "Exit status must be non-zero on HTTP discovery failure");
      // Verify provider-inventory was still written (partial progress preserved)
      const provPath = path.join(failConfigDir, "provider-inventory.json");
      assert.strictEqual(fs.existsSync(provPath), true, "Provider inventory should be preserved");
      // But model-inventory.json must NOT exist
      const modelPath = path.join(failConfigDir, "model-inventory.json");
      assert.strictEqual(fs.existsSync(modelPath), false, "Model inventory should not be written on failure");
    }
  });

  test.it("should preserve provider inventory but exit with nonzero code if no API key is available", async () => {
    const noKeyDir = path.join(tmpDir, "no-key-test");
    const noKeyConfigDir = path.join(tmpDir, "no-key-config");
    fs.mkdirSync(noKeyDir, { recursive: true });
    fs.mkdirSync(noKeyConfigDir, { recursive: true });

    const db = openDatabase(path.join(noKeyDir, "storage.sqlite"));
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, is_active INTEGER);
      CREATE TABLE provider_connections (provider TEXT PRIMARY KEY, is_active INTEGER);
      INSERT INTO provider_connections VALUES ('github', 1);
    `);
    db.close();

    try {
      await execAsync("node scripts/discover.js", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: noKeyDir,
          LIMITLESS_CONFIG_DIR: noKeyConfigDir,
          OMNIROUTE_BASE_URL: `http://127.0.0.1:${mockPort}`
        }
      });
      assert.fail("Should exit with nonzero code when no API key exists");
    } catch (e) {
      assert.strictEqual(e.code !== 0, true);
      assert.strictEqual(fs.existsSync(path.join(noKeyConfigDir, "provider-inventory.json")), true);
      assert.strictEqual(fs.existsSync(path.join(noKeyConfigDir, "model-inventory.json")), false);
    }
  });

  test.it("should exit with nonzero code if database does not exist", async () => {
    const missingDir = path.join(tmpDir, "nonexistent");
    try {
      await execAsync("node scripts/discover.js", {
        encoding: "utf8",
        env: { ...process.env, OMNIROUTE_DIR: missingDir, LIMITLESS_CONFIG_DIR: configDir }
      });
      assert.fail("Should fail when database does not exist");
    } catch (e) {
      assert.strictEqual(e.code !== 0, true);
      assert.match((e.stderr || '') + (e.stdout || ''), /OmniRoute database not found/);
    }
  });

  test.it("should warn that existing model inventory is not evidence of fresh scan when live discovery fails", async () => {
    const staleDir = path.join(tmpDir, "stale-inventory-test");
    const staleConfigDir = path.join(tmpDir, "stale-config");
    fs.mkdirSync(staleDir, { recursive: true });
    fs.mkdirSync(staleConfigDir, { recursive: true });

    // Seed database with valid key
    const db = openDatabase(path.join(staleDir, "storage.sqlite"));
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, is_active INTEGER);
      INSERT INTO api_keys VALUES ('stale-key', 1);
      CREATE TABLE provider_connections (provider TEXT PRIMARY KEY, is_active INTEGER);
      INSERT INTO provider_connections VALUES ('github', 1);
    `);
    db.close();

    // Create existing model-inventory.json from prior run
    const existingContent = JSON.stringify([{ id: "old/model", stale: true }]);
    fs.writeFileSync(path.join(staleConfigDir, "model-inventory.json"), existingContent);

    try {
      await execAsync("node scripts/discover.js", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: staleDir,
          LIMITLESS_CONFIG_DIR: staleConfigDir,
          OMNIROUTE_BASE_URL: "http://127.0.0.1:59999" // Unreachable port
        }
      });
      assert.fail("Must exit non-zero when live gateway is unreachable");
    } catch (e) {
      assert.strictEqual(e.code !== 0, true);
      const out = (e.stderr || '') + (e.stdout || '');
      assert.match(out, /Note: Existing model-inventory\.json was not updated and is not evidence of a fresh successful scan/);
      // Existing content must remain untouched
      const fileContent = fs.readFileSync(path.join(staleConfigDir, "model-inventory.json"), "utf8");
      assert.strictEqual(fileContent, existingContent);
    }
  });

  test.it("should print help message and exit cleanly without requiring or touching database when --help is passed", async () => {
    const nonexistentDir = path.join(tmpDir, "nonexistent-disc-" + Date.now());
    const { stdout } = await execAsync("node scripts/discover.js --help", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: nonexistentDir
      }
    });

    assert.match(stdout, /Limitless Claude Model & Provider Discovery CLI/);
    assert.strictEqual(fs.existsSync(nonexistentDir), false, "Help execution should not create or touch database directory");
  });
});
