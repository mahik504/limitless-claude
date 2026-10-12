const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
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
      env: { ...process.env, OMNIROUTE_DIR: TEST_DIR, LIMITLESS_CONFIG_DIR: CONFIG_DIR, TEST_STARTUP_DIR: STARTUP_DIR }
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
        LIMITLESS_EXCLUDE_PAID: "true"
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

    const output = execSync("node scripts/setup.js --exclude-paid", {
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

    // Seed database mimicking the user's pre-existing state where *opus* is 10 and *opusplan* is 9
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
        TEST_STARTUP_DIR: STARTUP_DIR
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
      env: { ...process.env, OMNIROUTE_DIR: TEST_DIR, LIMITLESS_CONFIG_DIR: CONFIG_DIR, TEST_STARTUP_DIR: STARTUP_DIR }
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
        env: { ...process.env, OMNIROUTE_DIR: badDbDir, LIMITLESS_CONFIG_DIR: CONFIG_DIR, TEST_STARTUP_DIR: STARTUP_DIR }
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
        env: { ...process.env, OMNIROUTE_DIR: emptyModelDir, LIMITLESS_CONFIG_DIR: emptyCacheDir, TEST_STARTUP_DIR: STARTUP_DIR }
      });
      assert.fail("Should have failed when candidate models are empty");
    } catch (e) {
      assert.strictEqual(e.status !== 0, true, "Exit status must be non-zero on failure");
      assert.match((e.stdout || '') + (e.stderr || '') + e.message, /No usable candidate models found/);
    }
  });
});
