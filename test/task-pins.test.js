const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { TaskPinManager } = require("../src/core/task-pins");
const { RoutingPolicy } = require("../src/core/routing-policy");

describe("Limitless Claude 8.1 - Task-to-Model Pinning Suite", () => {
  let tmpDir;
  let pinsFile;
  let pinManager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "limitless-pins-test-"));
    pinsFile = path.join(tmpDir, "task-pins.json");
    pinManager = new TaskPinManager(pinsFile);
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  });

  it("TaskPinManager - should set, get, list, and remove pins", () => {
    assert.deepStrictEqual(pinManager.listPins(), {});

    pinManager.setPin("backend", "kiro/claude-sonnet-4.5");
    assert.strictEqual(pinManager.getPin("backend"), "kiro/claude-sonnet-4.5");

    pinManager.setPin("FAST", "groq/openai/gpt-oss-20b");
    assert.strictEqual(pinManager.getPin("fast"), "groq/openai/gpt-oss-20b");

    const pins = pinManager.listPins();
    assert.strictEqual(Object.keys(pins).length, 2);

    const removed = pinManager.removePin("backend");
    assert.strictEqual(removed, true);
    assert.strictEqual(pinManager.getPin("backend"), null);

    pinManager.resetPins();
    assert.deepStrictEqual(pinManager.listPins(), {});
  });

  it("RoutingPolicy - should prioritize pinned model to index 0 when active", () => {
    pinManager.setPin("backend", "github/gpt-4o-2024-11-20");

    const policy = new RoutingPolicy({ taskPinManager: pinManager });

    const candidates = [
      { provider: "kiro", model: "claude-sonnet-4.5" },
      { provider: "github", model: "gpt-4o-2024-11-20" },
      { provider: "mistral", model: "codestral-latest" }
    ];

    const ordered = policy.orderCandidates(candidates, "backend");
    assert.strictEqual(ordered[0].model, "gpt-4o-2024-11-20");
    assert.strictEqual(ordered[0].provider, "github");
  });
});
