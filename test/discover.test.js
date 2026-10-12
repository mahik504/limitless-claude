const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");
const { openDatabase } = require("../src/omniroute/db");

test.describe("Model and Provider Discovery Script", () => {
  const tmpDir = path.join(os.tmpdir(), "disc-test-" + Date.now());
  const dbPath = path.join(tmpDir, "storage.sqlite");
  const configDir = path.join(tmpDir, "config");

  test.before(() => {
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
  });

  test.after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test.it("should discover providers from database and record last_scanned timestamp", () => {
    execSync("node scripts/discover.js", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: tmpDir,
        LIMITLESS_CONFIG_DIR: configDir,
        OMNIROUTE_BASE_URL: "http://127.0.0.1:59999"
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
  });

  test.it("should exit with nonzero code if database does not exist", () => {
    const missingDir = path.join(tmpDir, "nonexistent");
    try {
      execSync("node scripts/discover.js", {
        encoding: "utf8",
        env: { ...process.env, OMNIROUTE_DIR: missingDir, LIMITLESS_CONFIG_DIR: configDir }
      });
      assert.fail("Should fail when database does not exist");
    } catch (e) {
      assert.strictEqual(e.status !== 0, true);
      assert.match((e.stderr || '') + (e.stdout || ''), /OmniRoute database not found/);
    }
  });
});
