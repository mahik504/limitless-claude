const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const Database = require("better-sqlite3");
const os = require("os");

const TEST_DIR = path.join(os.tmpdir(), "limitless-claude-test-" + Date.now());
const DB_PATH = path.join(TEST_DIR, "storage.sqlite");

test.describe("Limitless Claude Setup Integrity", () => {

  test.before(() => {
    // Isolate tests completely: create a mock OmniRoute directory and DB schema
    fs.mkdirSync(TEST_DIR, { recursive: true });
    const db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE api_keys (key TEXT, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, catalog_scope TEXT, created_at DATETIME);
      INSERT INTO api_keys (key, created_at) VALUES ('test-key', datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();
  });

  test.after(() => {
    // Cleanup mock directory
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  test.it("should execute setup.js without crashing and handle transactions safely", () => {
    // Pass OMNIROUTE_DIR to isolate database execution
    const output = execSync("node scripts/setup.js", { 
      encoding: "utf8", 
      env: { ...process.env, OMNIROUTE_DIR: TEST_DIR }
    });
    assert.match(output, /=== Limitless Claude Setup Complete! ===/);
  });

  test.it("should output tier-configuration.json accurately", () => {
    const configPath = path.join(__dirname, "../config/tier-configuration.json");
    assert.strictEqual(fs.existsSync(configPath), true, "tier-configuration.json should exist");
    
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    assert.ok(config.haiku, "Haiku models should exist");
    assert.ok(config.sonnet, "Sonnet models should exist");
    assert.ok(config.opus, "Opus models should exist");
    assert.ok(config.fable, "Fable models should exist");
    
    assert.ok(config.opus.length > 0, "Opus should have fallback models");
  });

  test.it("should properly persist combos in the database without dropping the models array (v4.4.1 regression fix)", () => {
    const db = new Database(DB_PATH, { readonly: true });
    const row = db.prepare("SELECT data FROM combos WHERE id = 'combo/limitless-haiku'").get();
    
    assert.ok(row, "combo/limitless-haiku should exist in database");
    
    const data = JSON.parse(row.data);
    assert.strictEqual(data.strategy, "priority", "Haiku should use priority routing");
    assert.ok(Array.isArray(data.models), "Haiku data.models MUST be an array");
    assert.ok(data.models.length > 0, "Haiku data.models should have at least one fallback");

    const opusRow = db.prepare("SELECT data FROM combos WHERE id = 'combo/limitless-opus'").get();
    const opusData = JSON.parse(opusRow.data);
    assert.strictEqual(opusData.strategy, "round-robin", "Opus should use round-robin routing");
    assert.ok(Array.isArray(opusData.models), "Opus data.models MUST be an array");

    db.close();
  });

  test.it("should not inject fake identities in system prompts", () => {
    const db = new Database(DB_PATH, { readonly: true });
    const row = db.prepare("SELECT system_message FROM combos WHERE id = 'combo/limitless-opus'").get();
    
    assert.ok(row, "combo/limitless-opus should exist");
    assert.doesNotMatch(row.system_message, /You are Claude Opus/, "System prompt should NOT fabricate Anthropic identity");
    assert.match(row.system_message, /reasoning and coding powerhouse/, "System prompt should include functional instructions");
    
    db.close();
  });
});
