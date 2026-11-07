const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { FileCheckpointManager } = require("../src/core/file-checkpoint");

describe("Limitless Claude 8.1 - File Checkpoint & Undo Suite", () => {
  let tmpDir;
  let ckptBaseDir;
  let testFileA;
  let testFileB;
  let manager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "limitless-ckpt-test-"));
    ckptBaseDir = path.join(tmpDir, "checkpoints");
    manager = new FileCheckpointManager(ckptBaseDir);

    testFileA = path.join(tmpDir, "app.js");
    testFileB = path.join(tmpDir, "server.js");

    fs.writeFileSync(testFileA, "console.log('original A');", "utf8");
    fs.writeFileSync(testFileB, "console.log('original B');", "utf8");
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  });

  it("FileCheckpointManager - should create snapshot, list, and verify contents", () => {
    const manifest = manager.createCheckpoint("Initial state", [testFileA, testFileB]);
    assert.strictEqual(manifest.filesCount, 2);
    assert.strictEqual(manifest.description, "Initial state");

    const list = manager.listCheckpoints();
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, manifest.id);
  });

  it("FileCheckpointManager - should restore modified files accurately on undo", () => {
    const manifest = manager.createCheckpoint("Pre-edit state", [testFileA]);

    // Mutate file
    fs.writeFileSync(testFileA, "console.log('CORRUPTED / BROKEN EDIT');", "utf8");
    assert.strictEqual(fs.readFileSync(testFileA, "utf8"), "console.log('CORRUPTED / BROKEN EDIT');");

    // Test Dry-Run Restore
    const dryRunResult = manager.undoLast({ dryRun: true });
    assert.strictEqual(dryRunResult.dryRun, true);
    assert.strictEqual(fs.readFileSync(testFileA, "utf8"), "console.log('CORRUPTED / BROKEN EDIT');");

    // Test Actual Restore
    const restoreResult = manager.undoLast({ dryRun: false });
    assert.strictEqual(restoreResult.dryRun, false);
    assert.strictEqual(fs.readFileSync(testFileA, "utf8"), "console.log('original A');");
  });
});
