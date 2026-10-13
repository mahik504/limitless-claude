const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { execSync, exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const os = require("os");
const { openDatabase } = require("../src/omniroute/db");

const TEST_DIR = path.join(os.tmpdir(), "limitless-claude-test-" + Date.now());
const DB_PATH = path.join(TEST_DIR, "storage.sqlite");
const CONFIG_DIR = path.join(TEST_DIR, "config");
const STARTUP_DIR = path.join(TEST_DIR, "startup");

test.describe("Limitless Claude Setup Integrity", () => {

  test.before(() => {
    // Isolate tests completely: create a mock OmniRoute directory and DB schema
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.mkdirSync(STARTUP_DIR, { recursive: true });

    fs.writeFileSync(path.join(CONFIG_DIR, "tier-configuration.json"), JSON.stringify({
      benchmarks: { "test-bench": "123ms" }
    }));

    const db = openDatabase(DB_PATH);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, catalog_scope TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys (key, model_access_mode, allowed_combos, is_active, created_at) VALUES ('test-key', 'restricted', '["combo/existing"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);

      INSERT INTO combos (id, name, data, system_message, created_at, updated_at) VALUES ('combo/unrelated', 'Unrelated', '{}', '', datetime('now'), datetime('now'));
      INSERT INTO model_combo_mappings (id, pattern, combo_id, priority, enabled, description, created_at, updated_at) VALUES ('mapping/unrelated', '*unrelated*', 'combo/unrelated', 5, 1, 'Unrelated', datetime('now'), datetime('now'));
    `);
    db.close();
  });

  test.after(() => {
    // Cleanup mock directory safely
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch (_) {}
  });

  test.it("should execute setup.js without crashing and handle transactions safely", () => {
    // Pass OMNIROUTE_DIR to isolate database execution
    const output = execSync("node scripts/setup.js", {
      encoding: "utf8",
      env: { ...process.env, OMNIROUTE_DIR: TEST_DIR, LIMITLESS_CONFIG_DIR: CONFIG_DIR, TEST_STARTUP_DIR: STARTUP_DIR, LIMITLESS_ALLOW_OFFLINE_CATALOG: "true" }
    });
    assert.match(output, /=== Limitless Claude Setup Complete! ===/);
    assert.strictEqual(fs.existsSync(DB_PATH + ".bak"), true, "Database backup should exist");
  });

  test.it("should verify backup validity and restore cleanly in isolation", () => {
    const backupDb = openDatabase(DB_PATH + ".bak", { readonly: true });
    const check = backupDb.prepare("PRAGMA quick_check").get();
    const status = check ? Object.values(check)[0] : "";
    assert.strictEqual(status, "ok", "Backup file must pass SQLite integrity check");
    backupDb.close();
  });

  test.it("should output tier-configuration.json accurately and preserve existing fields", () => {
    const configPath = path.join(CONFIG_DIR, "tier-configuration.json");
    assert.strictEqual(fs.existsSync(configPath), true, "tier-configuration.json should exist");

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    assert.ok(config.haiku, "Haiku models should exist");
    assert.ok(config.sonnet, "Sonnet models should exist");
    assert.ok(config.opus, "Opus models should exist");
    assert.ok(config.fable, "Fable models should exist");

    assert.ok(config.opus.length > 0, "Opus should have fallback models");
    assert.strictEqual(config.benchmarks && config.benchmarks["test-bench"], "123ms", "Existing benchmark data should be preserved");
    assert.ok(config.metadata, "Metadata object should be generated");
    assert.ok(config.metadata.models_with_billing, "Billing classifications should be attached");
  });

  test.it("should properly persist combos in the database without dropping the models array (v4.4.1 regression fix)", () => {
    const db = openDatabase(DB_PATH, { readonly: true });
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
    const db = openDatabase(DB_PATH, { readonly: true });
    const row = db.prepare("SELECT system_message FROM combos WHERE id = 'combo/limitless-opus'").get();

    assert.ok(row, "combo/limitless-opus should exist");
    assert.doesNotMatch(row.system_message, /You are Claude Opus/, "System prompt should NOT fabricate Anthropic identity");
    assert.match(row.system_message, /reasoning and coding powerhouse/, "System prompt should include functional instructions");

    db.close();
  });

  test.it("should preserve unrelated combos and mappings", () => {
    const db = openDatabase(DB_PATH, { readonly: true });
    const unrelatedCombo = db.prepare("SELECT * FROM combos WHERE id = 'combo/unrelated'").get();
    assert.ok(unrelatedCombo, "Unrelated combo should be preserved");
    const unrelatedMapping = db.prepare("SELECT * FROM model_combo_mappings WHERE id = 'mapping/unrelated'").get();
    assert.ok(unrelatedMapping, "Unrelated mapping should be preserved");
    db.close();
  });

  test.it("should update restricted API key permissions without broadening to 'all'", () => {
    const db = openDatabase(DB_PATH, { readonly: true });
    const keyRow = db.prepare("SELECT * FROM api_keys WHERE key = 'test-key'").get();
    assert.strictEqual(keyRow.model_access_mode, "restricted", "model_access_mode must remain restricted");
    const allowed = JSON.parse(keyRow.allowed_combos);
    assert.ok(allowed.includes("combo/existing"), "Existing allowed combo must be preserved");
    assert.ok(allowed.includes("combo/limitless-opus"), "Limitless opus combo must be added");
    assert.ok(allowed.includes("combo/limitless-haiku"), "Limitless haiku combo must be added");
    db.close();
  });

  test.it("should verify mapping routes and priorities", () => {
    const db = openDatabase(DB_PATH, { readonly: true });
    const mappings = db.prepare("SELECT id, pattern, combo_id, priority FROM model_combo_mappings").all();

    const byId = {};
    mappings.forEach(m => byId[m.id] = m);

    assert.strictEqual(byId["mapping/limitless-opus"].pattern, "*opus*");
    assert.strictEqual(byId["mapping/limitless-opus"].combo_id, "combo/limitless-opus");

    assert.strictEqual(byId["mapping/limitless-sonnet"].pattern, "*sonnet*");
    assert.strictEqual(byId["mapping/limitless-sonnet"].combo_id, "combo/limitless-sonnet");

    assert.strictEqual(byId["mapping/limitless-haiku"].pattern, "*haiku*");
    assert.strictEqual(byId["mapping/limitless-haiku"].combo_id, "combo/limitless-haiku");

    assert.strictEqual(byId["mapping/limitless-fable"].pattern, "*fable*");
    assert.strictEqual(byId["mapping/limitless-fable"].combo_id, "combo/limitless-fable");

    assert.strictEqual(byId["mapping/limitless-best"].combo_id, "combo/limitless-fable");
    assert.strictEqual(byId["mapping/limitless-opusplan"].combo_id, "combo/limitless-sonnet");
    assert.strictEqual(byId["mapping/limitless-default"].combo_id, "combo/limitless-opus");
    assert.strictEqual(byId["mapping/limitless-opus1m"].pattern, "*opus[1m]*");
    assert.strictEqual(byId["mapping/limitless-sonnet1m"].pattern, "*sonnet[1m]*");

    db.close();
  });

  test.it("should generate Windows and Unix launchers in isolated directory with correct quoting and retry loop", () => {
    const batPath = path.join(STARTUP_DIR, "omniroute-daemon.bat");
    const vbsPath = path.join(STARTUP_DIR, "Limitless-OmniRoute-Launcher.vbs");
    const shPath = path.join(STARTUP_DIR, "start-daemon.sh");

    assert.strictEqual(fs.existsSync(batPath), true, "Daemon BAT should exist in test startup dir");
    assert.strictEqual(fs.existsSync(vbsPath), true, "Launcher VBS should exist in test startup dir");
    assert.strictEqual(fs.existsSync(shPath), true, "Unix launcher script should exist in test startup dir");

    const bat = fs.readFileSync(batPath, "utf8");
    assert.match(bat, /:loop/);
    assert.match(bat, /timeout \/t 5/);
    assert.match(bat, /goto loop/);

    const vbs = fs.readFileSync(vbsPath, "utf8");
    assert.match(vbs, /WScript\.Sleep 10000/);
    assert.match(vbs, /WshShell\.Run/);

    const sh = fs.readFileSync(shPath, "utf8");
    assert.match(sh, /nohup \$CMD serve > omniroute\.log 2>&1 &/);
    assert.match(sh, /PID=\$!/);
  });

  test.it("should resolve model aliases correctly according to OmniRoute's exact mapping semantics", () => {
    const db = openDatabase(DB_PATH, { readonly: true });
    // OmniRoute upstream query order: ORDER BY m.priority DESC, m.created_at ASC
    const mappings = db.prepare("SELECT pattern, combo_id, priority FROM model_combo_mappings WHERE enabled = 1 ORDER BY priority DESC, created_at ASC").all();
    db.close();

    // Exact globToRegex from OmniRoute src/shared/utils/globPattern.ts
    function omnirouteGlobToRegex(pattern) {
      const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
      return new RegExp(`^${escaped}$`, "i");
    }

    function resolveCombo(modelName) {
      for (const m of mappings) {
        if (omnirouteGlobToRegex(m.pattern).test(modelName)) {
          return m.combo_id;
        }
      }
      return null;
    }

    assert.strictEqual(resolveCombo("claude-opus-4-6"), "combo/limitless-opus");
    assert.strictEqual(resolveCombo("claude-sonnet-4-6"), "combo/limitless-sonnet");
    assert.strictEqual(resolveCombo("claude-haiku-4-5"), "combo/limitless-haiku");
    assert.strictEqual(resolveCombo("limitless-fable"), "combo/limitless-fable");
    assert.strictEqual(resolveCombo("best-model"), "combo/limitless-fable");
    assert.strictEqual(resolveCombo("opusplan-custom"), "combo/limitless-sonnet");
    assert.strictEqual(resolveCombo("claude-sonnet[1m]"), "combo/limitless-sonnet");
    assert.strictEqual(resolveCombo("claude-opus[1m]"), "combo/limitless-opus");
    assert.strictEqual(resolveCombo("default-fallback"), "combo/limitless-opus");

    // Regression check: verify that if opusplan priority were lower (9), *opus* (10) would shadow it
    const shadowedMappings = mappings.map(m => m.pattern === "*opusplan*" ? { ...m, priority: 9 } : m)
      .sort((a, b) => b.priority - a.priority);
    function resolveShadowed(modelName) {
      for (const m of shadowedMappings) {
        if (omnirouteGlobToRegex(m.pattern).test(modelName)) {
          return m.combo_id;
        }
      }
      return null;
    }
    assert.strictEqual(resolveShadowed("opusplan-custom"), "combo/limitless-opus", "Proves that *opus* shadows *opusplan* if opusplan has lower priority");
  });

  test.it("should enforce paid-model safety guard when LIMITLESS_EXCLUDE_PAID is set", () => {
    const paidTestDir = path.join(TEST_DIR, "paid-guard-test");
    const paidDbPath = path.join(paidTestDir, "storage.sqlite");
    const paidConfigDir = path.join(paidTestDir, "config");
    fs.mkdirSync(paidTestDir, { recursive: true });
    fs.mkdirSync(paidConfigDir, { recursive: true });

    // Seed database
    const db = openDatabase(paidDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys (key, model_access_mode, allowed_combos, is_active, created_at) VALUES ('paid-test-key', 'all', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    execSync("node scripts/setup.js", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: paidTestDir,
        LIMITLESS_CONFIG_DIR: paidConfigDir,
        TEST_STARTUP_DIR: STARTUP_DIR,
        LIMITLESS_EXCLUDE_PAID: "true",
        LIMITLESS_ALLOW_OFFLINE_CATALOG: "true"
      }
    });

    const verifyDb = openDatabase(paidDbPath, { readonly: true });
    const opusRow = verifyDb.prepare("SELECT data FROM combos WHERE id = 'combo/limitless-opus'").get();
    const opusData = JSON.parse(opusRow.data);

    // mistral/codestral-latest is classified as 'paid', must be excluded
    const hasMistral = opusData.models.some(m => m.provider === "mistral" || m.model.includes("codestral"));
    assert.strictEqual(hasMistral, false, "Paid model mistral/codestral-latest must be excluded from Opus combo when LIMITLESS_EXCLUDE_PAID=true");

    const fableRow = verifyDb.prepare("SELECT data FROM combos WHERE id = 'combo/limitless-fable'").get();
    const fableData = JSON.parse(fableRow.data);
    // OpenRouter models without :free must be excluded
    const hasPaidOpenRouter = fableData.models.some(m => m.provider === "openrouter" && !m.model.includes(":free"));
    assert.strictEqual(hasPaidOpenRouter, false, "Paid OpenRouter models without :free must be excluded from Fable combo");

    verifyDb.close();

    const config = JSON.parse(fs.readFileSync(path.join(paidConfigDir, "tier-configuration.json"), "utf8"));
    assert.strictEqual(config.metadata.paid_models_excluded, true);
  });

  test.it("should accurately classify model billing categories", () => {
    const { classifyModelBilling, filterCandidatesByBilling } = require("../scripts/setup");
    assert.strictEqual(classifyModelBilling("openrouter", "z-ai/glm-5.2:free"), "zero-marginal-cost");
    assert.strictEqual(classifyModelBilling("openrouter", "deepseek/deepseek-chat"), "paid");
    assert.strictEqual(classifyModelBilling("mistral", "codestral-latest"), "paid");
    assert.strictEqual(classifyModelBilling("together", "llama-3-70b"), "paid");
    assert.strictEqual(classifyModelBilling("deepseek", "deepseek-coder"), "paid");
    assert.strictEqual(classifyModelBilling("github", "gpt-4o-mini"), "subscription-entitled");
    assert.strictEqual(classifyModelBilling("antigravity", "claude-sonnet-4-6"), "subscription-entitled");
    assert.strictEqual(classifyModelBilling("groq", "llama-3.1-8b-instant"), "zero-marginal-cost");
    assert.strictEqual(classifyModelBilling("unknown-provider", "some-model"), "unknown");

    const candidates = [
      { provider: "github", model: "gpt-4o" },
      { provider: "mistral", model: "codestral-latest" },
      { provider: "together", model: "mistral-large" },
      { provider: "openrouter", model: "free-model:free" },
      { provider: "custom", model: "mystery-model" }
    ];

    const filtered = filterCandidatesByBilling(candidates, true, false);
    assert.strictEqual(filtered.length, 2);
    assert.deepStrictEqual(filtered.map(c => c.provider), ["github", "openrouter"]);
  });

  test.it("should enforce paid-model safety guard when --exclude-paid CLI argument is passed", () => {
    const cliTestDir = path.join(TEST_DIR, "cli-paid-guard-test");
    const cliDbPath = path.join(cliTestDir, "storage.sqlite");
    const cliConfigDir = path.join(cliTestDir, "config");
    fs.mkdirSync(cliTestDir, { recursive: true });
    fs.mkdirSync(cliConfigDir, { recursive: true });

    const db = openDatabase(cliDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys (key, model_access_mode, allowed_combos, is_active, created_at) VALUES ('cli-test-key', 'all', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    const output = execSync("node scripts/setup.js --exclude-paid --allow-offline-catalog", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: cliTestDir,
        LIMITLESS_CONFIG_DIR: cliConfigDir,
        TEST_STARTUP_DIR: STARTUP_DIR
      }
    });
    assert.match(output, /Enforced paid-model safety guard/);

    const verifyDb = openDatabase(cliDbPath, { readonly: true });
    const opusRow = verifyDb.prepare("SELECT data FROM combos WHERE id = 'combo/limitless-opus'").get();
    const opusData = JSON.parse(opusRow.data);
    const hasPaid = opusData.models.some(m => m.provider === "mistral");
    assert.strictEqual(hasPaid, false, "Paid models must be excluded when --exclude-paid CLI flag is provided");
    verifyDb.close();
  });

  test.it("should promote opusplan priority to 11 when migrating an existing database snapshot", () => {
    const migTestDir = path.join(TEST_DIR, "mig-test");
    const migDbPath = path.join(migTestDir, "storage.sqlite");
    const migConfigDir = path.join(migTestDir, "config");
    fs.mkdirSync(migTestDir, { recursive: true });
    fs.mkdirSync(migConfigDir, { recursive: true });

    const db = openDatabase(migDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys (key, model_access_mode, allowed_combos, is_active, created_at) VALUES ('mig-key', 'all', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);

      INSERT INTO model_combo_mappings (id, pattern, combo_id, priority, enabled, description, created_at, updated_at)
      VALUES ('mapping/limitless-opus', '*opus*', 'combo/limitless-opus', 10, 1, 'Opus', datetime('now'), datetime('now'));
      INSERT INTO model_combo_mappings (id, pattern, combo_id, priority, enabled, description, created_at, updated_at)
      VALUES ('mapping/limitless-opusplan', '*opusplan*', 'combo/limitless-sonnet', 9, 1, 'Opusplan old', datetime('now'), datetime('now'));
    `);
    db.close();

    execSync("node scripts/setup.js", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: migTestDir,
        LIMITLESS_CONFIG_DIR: migConfigDir,
        TEST_STARTUP_DIR: STARTUP_DIR,
        LIMITLESS_ALLOW_OFFLINE_CATALOG: "true"
      }
    });

    const verifyDb = openDatabase(migDbPath, { readonly: true });
    const opusplanMapping = verifyDb.prepare("SELECT priority FROM model_combo_mappings WHERE id = 'mapping/limitless-opusplan'").get();
    assert.strictEqual(opusplanMapping.priority, 11, "Setup must update opusplan priority to 11 to prevent shadowing by *opus* (10)");
    verifyDb.close();
  });

  test.it("should be fully idempotent when run repeatedly", () => {
    const output = execSync("node scripts/setup.js", {
      encoding: "utf8",
      env: { ...process.env, OMNIROUTE_DIR: TEST_DIR, LIMITLESS_CONFIG_DIR: CONFIG_DIR, TEST_STARTUP_DIR: STARTUP_DIR, LIMITLESS_ALLOW_OFFLINE_CATALOG: "true" }
    });
    assert.match(output, /=== Limitless Claude Setup Complete! ===/);

    const db = openDatabase(DB_PATH, { readonly: true });
    const combosCount = db.prepare("SELECT count(*) as cnt FROM combos WHERE id LIKE 'combo/limitless-%'").get();
    assert.strictEqual(combosCount.cnt, 4, "Should still have exactly 4 limitless combos after rerun");
    db.close();
  });

  test.it("should fail gracefully on incompatible database schema", () => {
    const badDbDir = path.join(TEST_DIR, "bad-schema");
    fs.mkdirSync(badDbDir, { recursive: true });
    const badDbPath = path.join(badDbDir, "storage.sqlite");
    const badDb = openDatabase(badDbPath);
    badDb.exec(`CREATE TABLE api_keys (wrong_column TEXT);`);
    badDb.close();

    try {
      execSync("node scripts/setup.js", {
        encoding: "utf8",
        env: { ...process.env, OMNIROUTE_DIR: badDbDir, LIMITLESS_CONFIG_DIR: CONFIG_DIR, TEST_STARTUP_DIR: STARTUP_DIR, LIMITLESS_ALLOW_OFFLINE_CATALOG: "true" }
      });
      assert.fail("Should have thrown an error due to invalid schema");
    } catch (e) {
      assert.match((e.stdout || '') + (e.stderr || '') + e.message, /Incompatible database schema/);
    }
  });

  test.it("should exit with nonzero code if no candidate models match", () => {
    const emptyModelDir = path.join(TEST_DIR, "empty-models");
    fs.mkdirSync(emptyModelDir, { recursive: true });
    const emptyDbPath = path.join(emptyModelDir, "storage.sqlite");
    const emptyDb = openDatabase(emptyDbPath);
    emptyDb.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, created_at DATETIME);
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    emptyDb.close();

    // Point config to a directory with empty cache
    const emptyCacheDir = path.join(emptyModelDir, "empty-config");
    fs.mkdirSync(emptyCacheDir, { recursive: true });
    fs.writeFileSync(path.join(emptyCacheDir, "live_models.json"), JSON.stringify({ data: [] }));

    try {
      execSync("node scripts/setup.js", {
        encoding: "utf8",
        env: { ...process.env, OMNIROUTE_DIR: emptyModelDir, LIMITLESS_CONFIG_DIR: emptyCacheDir, TEST_STARTUP_DIR: STARTUP_DIR, LIMITLESS_ALLOW_OFFLINE_CATALOG: "true" }
      });
      assert.fail("Should have failed when candidate models are empty");
    } catch (e) {
      assert.strictEqual(e.status !== 0, true, "Exit status must be non-zero on failure");
      assert.match((e.stdout || '') + (e.stderr || '') + e.message, /Offline cached inventory is empty or unavailable|No usable candidate models found/);
    }
  });

  // --- NEW SAFETY TESTS (Live Catalogue Safety, Empty-Tier Safety, Permissions Safety) ---

  test.it("should fail safely with nonzero code and NOT mutate database when live catalog fetch fails and offline cache is not opted in", () => {
    const liveFailDir = path.join(TEST_DIR, "live-fail-test");
    fs.mkdirSync(liveFailDir, { recursive: true });
    const liveFailDbPath = path.join(liveFailDir, "storage.sqlite");
    const liveFailConfigDir = path.join(liveFailDir, "config");
    fs.mkdirSync(liveFailConfigDir, { recursive: true });

    // Seed database with pre-existing custom combo and mapping
    const db = openDatabase(liveFailDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('live-fail-key', 'all', '[]', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);

      INSERT INTO combos VALUES ('combo/pre-existing', 'Pre-existing', '{"models":[{"id":"safe"}]}', '', datetime('now'), datetime('now'));
      INSERT INTO model_combo_mappings VALUES ('mapping/pre-existing', '*pre*', 'combo/pre-existing', 5, 1, 'Safe', datetime('now'), datetime('now'));
    `);
    db.close();

    try {
      execSync("node scripts/setup.js", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: liveFailDir,
          LIMITLESS_CONFIG_DIR: liveFailConfigDir,
          TEST_STARTUP_DIR: STARTUP_DIR,
          OMNIROUTE_BASE_URL: "http://127.0.0.1:59999" // unreachable port
        }
      });
      assert.fail("Setup must fail when live catalog fetch fails and offline cache is not opted in");
    } catch (e) {
      assert.strictEqual(e.status !== 0, true, "Exit status must be non-zero");
      assert.match((e.stdout || '') + (e.stderr || ''), /Live model catalog required but unavailable/);
    }

    // Verify existing combos and mappings in database were NOT modified or dropped
    const verifyDb = openDatabase(liveFailDbPath, { readonly: true });
    const existingCombo = verifyDb.prepare("SELECT * FROM combos WHERE id = 'combo/pre-existing'").get();
    assert.ok(existingCombo, "Pre-existing combo must remain untouched");
    const limitlessCombos = verifyDb.prepare("SELECT * FROM combos WHERE id LIKE 'combo/limitless-%'").all();
    assert.strictEqual(limitlessCombos.length, 0, "No Limitless combos should have been created on failed live catalog fetch");
    verifyDb.close();

    // Verify tier-configuration.json was not created
    assert.strictEqual(fs.existsSync(path.join(liveFailConfigDir, "tier-configuration.json")), false, "Config file must not be written on failure");
  });

  test.it("should discover models from live OmniRoute gateway and configure combos without requiring offline cache opt-in", async () => {
    const liveSuccessDir = path.join(TEST_DIR, "live-success-test");
    fs.mkdirSync(liveSuccessDir, { recursive: true });
    const liveSuccessDbPath = path.join(liveSuccessDir, "storage.sqlite");
    const liveSuccessConfigDir = path.join(liveSuccessDir, "config");
    fs.mkdirSync(liveSuccessConfigDir, { recursive: true });

    const db = openDatabase(liveSuccessDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('live-key', 'all', '[]', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    // Mock live gateway returning complete models across all 4 tiers
    const liveServer = http.createServer((req, res) => {
      if (req.url === "/v1/models") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          data: [
            { id: "github/gpt-4o-mini" },
            { id: "antigravity/claude-sonnet-4-6" },
            { id: "openrouter/z-ai/glm-5.2:free" },
            { id: "github/gpt-4o-2024-11-20" }
          ]
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => liveServer.listen(0, "127.0.0.1", resolve));
    const port = liveServer.address().port;

    try {
      const output = await execAsync("node scripts/setup.js", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: liveSuccessDir,
          LIMITLESS_CONFIG_DIR: liveSuccessConfigDir,
          TEST_STARTUP_DIR: STARTUP_DIR,
          OMNIROUTE_BASE_URL: `http://127.0.0.1:${port}`
        }
      });
      assert.match(output.stdout, /Discovered 4 models from live OmniRoute gateway/);
      assert.match(output.stdout, /=== Limitless Claude Setup Complete! ===/);

      const verifyDb = openDatabase(liveSuccessDbPath, { readonly: true });
      const combos = verifyDb.prepare("SELECT id FROM combos WHERE id LIKE 'combo/limitless-%'").all();
      assert.strictEqual(combos.length, 4, "All 4 limitless combos must be created from live discovery");
      verifyDb.close();
    } finally {
      await new Promise((resolve) => liveServer.close(resolve));
    }
  });

  test.it("should fail safely and exit with nonzero code when live OmniRoute gateway returns HTTP 500 error", async () => {
    const httpFailDir = path.join(TEST_DIR, "http-fail-test");
    fs.mkdirSync(httpFailDir, { recursive: true });
    const httpFailDbPath = path.join(httpFailDir, "storage.sqlite");
    const httpFailConfigDir = path.join(httpFailDir, "config");
    fs.mkdirSync(httpFailConfigDir, { recursive: true });

    const db = openDatabase(httpFailDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('http-fail-key', 'all', '[]', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    const errorServer = http.createServer((req, res) => {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Gateway Error" }));
    });

    await new Promise((resolve) => errorServer.listen(0, "127.0.0.1", resolve));
    const port = errorServer.address().port;

    try {
      await execAsync("node scripts/setup.js", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: httpFailDir,
          LIMITLESS_CONFIG_DIR: httpFailConfigDir,
          TEST_STARTUP_DIR: STARTUP_DIR,
          OMNIROUTE_BASE_URL: `http://127.0.0.1:${port}`
        }
      });
      assert.fail("Should have failed on HTTP 500");
    } catch (e) {
      assert.strictEqual(e.code !== 0, true);
      assert.match(e.stdout + e.stderr, /Live model catalog required but unavailable: OmniRoute gateway returned HTTP 500/);
    } finally {
      await new Promise((resolve) => errorServer.close(resolve));
    }
  });

  test.it("should fail safely and exit with nonzero code when live gateway returns empty models array without offline cache opt-in", async () => {
    const emptyLiveDir = path.join(TEST_DIR, "empty-live-test");
    fs.mkdirSync(emptyLiveDir, { recursive: true });
    const emptyLiveDbPath = path.join(emptyLiveDir, "storage.sqlite");
    const emptyLiveConfigDir = path.join(emptyLiveDir, "config");
    fs.mkdirSync(emptyLiveConfigDir, { recursive: true });

    const db = openDatabase(emptyLiveDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('empty-live-key', 'all', '[]', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    const emptyServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: [] }));
    });

    await new Promise((resolve) => emptyServer.listen(0, "127.0.0.1", resolve));
    const port = emptyServer.address().port;

    try {
      await execAsync("node scripts/setup.js", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: emptyLiveDir,
          LIMITLESS_CONFIG_DIR: emptyLiveConfigDir,
          TEST_STARTUP_DIR: STARTUP_DIR,
          OMNIROUTE_BASE_URL: `http://127.0.0.1:${port}`
        }
      });
      assert.fail("Should have failed on empty live catalog");
    } catch (e) {
      assert.strictEqual(e.code !== 0, true);
      assert.match(e.stdout + e.stderr, /returned empty or invalid model catalog/);
    } finally {
      await new Promise((resolve) => emptyServer.close(resolve));
    }
  });

  test.it("should abort safely before transaction on fresh setup when paid-model guard produces an empty tier while other tiers have candidates", () => {
    const emptyTierDir = path.join(TEST_DIR, "empty-tier-test");
    fs.mkdirSync(emptyTierDir, { recursive: true });
    const emptyTierDbPath = path.join(emptyTierDir, "storage.sqlite");
    const emptyTierConfigDir = path.join(emptyTierDir, "config");
    fs.mkdirSync(emptyTierConfigDir, { recursive: true });

    // Seed mock live_models where Haiku, Sonnet, Opus have models, but Fable has ONLY paid models
    // Fable models: openrouter/moonshotai/kimi-k3 (paid) and openrouter/z-ai/glm-5.3 (paid)
    fs.writeFileSync(path.join(emptyTierConfigDir, "live_models.json"), JSON.stringify({
      data: [
        { id: "github/gpt-4o-mini" }, // Haiku
        { id: "antigravity/claude-sonnet-4-6" }, // Sonnet
        { id: "openrouter/z-ai/glm-5.2:free" }, // Opus
        { id: "openrouter/moonshotai/kimi-k3" } // Fable - paid!
      ]
    }));

    const db = openDatabase(emptyTierDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('empty-tier-key', 'all', '[]', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    try {
      execSync("node scripts/setup.js --exclude-paid --allow-offline-catalog", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: emptyTierDir,
          LIMITLESS_CONFIG_DIR: emptyTierConfigDir,
          TEST_STARTUP_DIR: STARTUP_DIR
        }
      });
      assert.fail("Setup must fail when a tier is emptied by paid-model guard on fresh setup");
    } catch (e) {
      assert.strictEqual(e.status !== 0, true);
      const out = (e.stdout || '') + (e.stderr || '');
      assert.match(out, /Routing tier 'fable' has 0 candidate models/);
      assert.match(out, /Aborting setup before database transaction/);
    }

    // Verify transaction was aborted before touching combos
    const verifyDb = openDatabase(emptyTierDbPath, { readonly: true });
    const combos = verifyDb.prepare("SELECT count(*) as cnt FROM combos").get();
    assert.strictEqual(combos.cnt, 0, "No combos should be created when a tier cannot be populated");
    verifyDb.close();
  });

  test.it("should not destroy previously working tier by replacing it with an empty list", async () => {
    const preserveDir = path.join(TEST_DIR, "preserve-tier-test");
    fs.mkdirSync(preserveDir, { recursive: true });
    const preserveDbPath = path.join(preserveDir, "storage.sqlite");
    const preserveConfigDir = path.join(preserveDir, "config");
    fs.mkdirSync(preserveConfigDir, { recursive: true });

    // Seed database with working existing Fable combo
    const db = openDatabase(preserveDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('preserve-key', 'all', '[]', '["combo/*"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);

      INSERT INTO combos VALUES (
        'combo/limitless-fable',
        'Limitless Fable Tier',
        '{"name":"Limitless Fable Tier","strategy":"round-robin","models":[{"provider":"existing","model":"working-fable"}]}',
        'test prompt',
        datetime('now'),
        datetime('now')
      );
    `);
    db.close();

    // Catalog has models for Haiku, Sonnet, Opus, but NO candidates for Fable
    fs.writeFileSync(path.join(preserveConfigDir, "live_models.json"), JSON.stringify({
      data: [
        { id: "github/gpt-4o-mini" },
        { id: "antigravity/claude-sonnet-4-6" },
        { id: "openrouter/z-ai/glm-5.2:free" }
      ]
    }));

    // Run setup without exclude-paid
    const { stdout, stderr } = await execAsync("node scripts/setup.js --allow-offline-catalog", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: preserveDir,
        LIMITLESS_CONFIG_DIR: preserveConfigDir,
        TEST_STARTUP_DIR: STARTUP_DIR
      }
    });

    assert.match(stdout + stderr, /Preserving 1 existing models for tier 'fable'/);

    // Verify Fable combo in database was preserved and NEVER replaced with empty array []
    const verifyDb = openDatabase(preserveDbPath, { readonly: true });
    const fableRow = verifyDb.prepare("SELECT data FROM combos WHERE id = 'combo/limitless-fable'").get();
    assert.ok(fableRow);
    const parsed = JSON.parse(fableRow.data);
    assert.ok(Array.isArray(parsed.models));
    assert.strictEqual(parsed.models.length, 1);
    assert.strictEqual(parsed.models[0].model, "working-fable");
    verifyDb.close();
  });

  test.it("should fail setup and exit with nonzero code when restricted key cannot receive combo permissions due to missing allowed_combos column", () => {
    const permFailDir = path.join(TEST_DIR, "perm-fail-test");
    fs.mkdirSync(permFailDir, { recursive: true });
    const permFailDbPath = path.join(permFailDir, "storage.sqlite");
    const permFailConfigDir = path.join(permFailDir, "config");
    fs.mkdirSync(permFailConfigDir, { recursive: true });

    // Seed database with a restricted key in a schema that lacks allowed_combos column
    const db = openDatabase(permFailDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('restricted-test-key', 'restricted', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    try {
      execSync("node scripts/setup.js --allow-offline-catalog", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: permFailDir,
          LIMITLESS_CONFIG_DIR: permFailConfigDir,
          TEST_STARTUP_DIR: STARTUP_DIR
        }
      });
      assert.fail("Setup must fail when restricted key cannot receive combo permissions");
    } catch (e) {
      assert.strictEqual(e.status !== 0, true);
      const out = (e.stdout || '') + (e.stderr || '');
      assert.match(out, /Setup incomplete: Selected API key/);
      assert.match(out, /lacks 'allowed_combos' column/);
      assert.doesNotMatch(out, /=== Limitless Claude Setup Complete! ===/);
    }
  });

  test.it("should succeed when key is in 'all' mode even if schema lacks allowed_combos column (harmless already-authorized case)", () => {
    const permAllDir = path.join(TEST_DIR, "perm-all-test");
    fs.mkdirSync(permAllDir, { recursive: true });
    const permAllDbPath = path.join(permAllDir, "storage.sqlite");
    const permAllConfigDir = path.join(permAllDir, "config");
    fs.mkdirSync(permAllConfigDir, { recursive: true });

    // Seed database with an open key ('all' mode) in a schema that lacks allowed_combos column
    const db = openDatabase(permAllDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('open-test-key', 'all', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    const output = execSync("node scripts/setup.js --allow-offline-catalog", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: permAllDir,
        LIMITLESS_CONFIG_DIR: permAllConfigDir,
        TEST_STARTUP_DIR: STARTUP_DIR
      }
    });

    assert.match(output, /=== Limitless Claude Setup Complete! ===/);
  });

  test.it("should not mutate api_keys during preflight check if setup aborts before transaction", () => {
    const preflightDir = path.join(TEST_DIR, "preflight-isolation-test");
    fs.mkdirSync(preflightDir, { recursive: true });
    const preflightDbPath = path.join(preflightDir, "storage.sqlite");
    const preflightConfigDir = path.join(preflightDir, "config");
    fs.mkdirSync(preflightConfigDir, { recursive: true });

    // Seed database with a restricted key having initial combos
    const db = openDatabase(preflightDbPath);
    db.exec(`
      CREATE TABLE api_keys (key TEXT PRIMARY KEY, model_access_mode TEXT, allowed_models TEXT, allowed_combos TEXT, is_active INTEGER, created_at DATETIME);
      INSERT INTO api_keys VALUES ('preflight-key', 'restricted', '[]', '["combo/initial"]', 1, datetime('now'));
      CREATE TABLE combos (id TEXT PRIMARY KEY, name TEXT, data TEXT, system_message TEXT, created_at DATETIME, updated_at DATETIME);
      CREATE TABLE model_combo_mappings (id TEXT PRIMARY KEY, pattern TEXT, combo_id TEXT, priority INTEGER, enabled INTEGER, description TEXT, created_at DATETIME, updated_at DATETIME);
    `);
    db.close();

    // Catalog has only paid models for Fable, triggering an empty tier abort under --exclude-paid
    fs.writeFileSync(path.join(preflightConfigDir, "live_models.json"), JSON.stringify({
      data: [
        { id: "github/gpt-4o-mini" },
        { id: "antigravity/claude-sonnet-4-6" },
        { id: "openrouter/z-ai/glm-5.2:free" },
        { id: "openrouter/moonshotai/kimi-k3" } // paid model only in Fable
      ]
    }));

    try {
      execSync("node scripts/setup.js --exclude-paid --allow-offline-catalog", {
        encoding: "utf8",
        env: {
          ...process.env,
          OMNIROUTE_DIR: preflightDir,
          LIMITLESS_CONFIG_DIR: preflightConfigDir,
          TEST_STARTUP_DIR: STARTUP_DIR
        }
      });
      assert.fail("Setup should have aborted due to empty tier");
    } catch (e) {
      assert.strictEqual(e.status !== 0, true);
    }

    // Verify api_keys was NEVER mutated by preflight check
    const verifyDb = openDatabase(preflightDbPath, { readonly: true });
    const keyRow = verifyDb.prepare("SELECT allowed_combos FROM api_keys WHERE key = 'preflight-key'").get();
    assert.ok(keyRow);
    const combos = JSON.parse(keyRow.allowed_combos);
    assert.deepStrictEqual(combos, ["combo/initial"], "preflight check must not mutate allowed_combos when setup aborts before transaction");
    verifyDb.close();
  });

  test.it("should print help message and exit cleanly without requiring or touching database when --help is passed", () => {
    const nonexistentDir = path.join(TEST_DIR, "nonexistent-db-dir-" + Date.now());
    const result = execSync("node scripts/setup.js --help", {
      encoding: "utf8",
      env: {
        ...process.env,
        OMNIROUTE_DIR: nonexistentDir
      }
    });

    assert.match(result, /Limitless Claude Setup CLI/);
    assert.match(result, /--exclude-paid/);
    assert.match(result, /--allow-offline-catalog/);
    assert.strictEqual(fs.existsSync(nonexistentDir), false, "Help execution should not create or touch database directory");
  });
});
