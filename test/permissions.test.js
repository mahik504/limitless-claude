const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { openDatabase } = require("../src/omniroute/db");
const { findTargetApiKey, safelyConfigureComboPermissions } = require("../src/omniroute/permissions");

test.describe("OmniRoute API Key Permission Safety", () => {
  const tmpDir = path.join(os.tmpdir(), "perm-test-" + Date.now());
  const dbPath = path.join(tmpDir, "storage.sqlite");
  let db;

  test.before(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    db = openDatabase(dbPath);
    db.exec(`
      CREATE TABLE api_keys (
        key TEXT PRIMARY KEY,
        model_access_mode TEXT,
        allowed_models TEXT,
        allowed_combos TEXT,
        catalog_scope TEXT,
        is_active INTEGER,
        created_at DATETIME,
        last_used_at DATETIME
      );

      INSERT INTO api_keys (key, model_access_mode, allowed_models, allowed_combos, is_active, created_at, last_used_at)
      VALUES ('key-restricted', 'restricted', '["model-custom"]', '["combo/custom"]', 1, datetime('now', '-2 days'), datetime('now', '-1 hour'));

      INSERT INTO api_keys (key, model_access_mode, allowed_models, allowed_combos, is_active, created_at, last_used_at)
      VALUES ('key-open', 'all', '[]', '["combo/*"]', 1, datetime('now', '-1 days'), datetime('now', '-2 hours'));

      INSERT INTO api_keys (key, model_access_mode, allowed_models, allowed_combos, is_active, created_at)
      VALUES ('key-inactive', 'all', '[]', '[]', 0, datetime('now'));
    `);
  });

  test.after(() => {
    db.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test.it("should prefer explicit key if requested", () => {
    const key = findTargetApiKey(db, "key-open");
    assert.ok(key);
    assert.strictEqual(key.key, "key-open");
  });

  test.it("should select most active non-revoked key when no explicit key requested", () => {
    const key = findTargetApiKey(db);
    assert.ok(key);
    assert.strictEqual(key.key, "key-restricted", "Should select active key with most recent last_used_at");
  });

  test.it("should preserve restricted mode and existing allowed_models when adding combos", () => {
    const result = safelyConfigureComboPermissions(db, "key-restricted", [
      "combo/limitless-haiku",
      "combo/limitless-sonnet"
    ]);

    assert.strictEqual(result.changed, true);
    assert.strictEqual(result.mode, "restricted");

    const row = db.prepare("SELECT * FROM api_keys WHERE key = 'key-restricted'").get();
    assert.strictEqual(row.model_access_mode, "restricted", "model_access_mode must not be widened to 'all'");
    assert.strictEqual(row.allowed_models, '["model-custom"]', "allowed_models must remain completely intact");

    const combos = JSON.parse(row.allowed_combos);
    assert.ok(combos.includes("combo/custom"), "Original combo must be preserved");
    assert.ok(combos.includes("combo/limitless-haiku"));
    assert.ok(combos.includes("combo/limitless-sonnet"));
  });

  test.it("should not make changes if key already has full combo access or wildcard", () => {
    const result = safelyConfigureComboPermissions(db, "key-open", [
      "combo/limitless-opus"
    ]);

    assert.strictEqual(result.changed, false);
    assert.strictEqual(result.reason, "already_permitted");

    const row = db.prepare("SELECT * FROM api_keys WHERE key = 'key-open'").get();
    assert.strictEqual(row.allowed_combos, '["combo/*"]');
  });

  test.it("should be idempotent when called multiple times on the same key", () => {
    const res1 = safelyConfigureComboPermissions(db, "key-restricted", ["combo/limitless-fable"]);
    assert.strictEqual(res1.changed, true);

    const res2 = safelyConfigureComboPermissions(db, "key-restricted", ["combo/limitless-fable"]);
    assert.strictEqual(res2.changed, false);
    assert.strictEqual(res2.reason, "already_permitted");
  });
});
