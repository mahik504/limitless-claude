const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { openDatabase, backupDatabase } = require("../src/omniroute/db");

test.describe("SQLite Driver Adapter & WAL-Safe Backup", () => {
  const tmpDir = path.join(os.tmpdir(), "db-test-" + Date.now());
  const dbPath = path.join(tmpDir, "test.sqlite");
  const backupPath = path.join(tmpDir, "test.sqlite.bak");

  test.before(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  test.after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test.it("should create WAL-mode database and perform uncheckpointed writes", () => {
    const db = openDatabase(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("CREATE TABLE records (id INTEGER PRIMARY KEY, value TEXT);");

    const insert = db.prepare("INSERT INTO records (value) VALUES (?)");
    insert.run("uncheckpointed-record-1");
    insert.run("uncheckpointed-record-2");

    const count = db.prepare("SELECT count(*) as cnt FROM records").get();
    assert.strictEqual(count.cnt, 2);

    // Verify WAL file was created
    assert.strictEqual(fs.existsSync(dbPath + "-wal"), true, "WAL file should exist");

    // Perform backup while database is active with uncheckpointed WAL
    const backedUp = backupDatabase(db, dbPath, backupPath);
    assert.strictEqual(backedUp, true);
    assert.strictEqual(fs.existsSync(backupPath), true);

    db.close();
  });

  test.it("should restore and verify WAL-consistent backup in isolated environment", () => {
    const backupDb = openDatabase(backupPath, { readonly: true });
    const count = backupDb.prepare("SELECT count(*) as cnt FROM records").get();
    assert.strictEqual(count.cnt, 2, "Backup must contain rows written to WAL");

    const check = backupDb.prepare("PRAGMA quick_check").get();
    const result = check ? Object.values(check)[0] : "";
    assert.strictEqual(result, "ok", "Backup file must be completely valid SQLite database");

    backupDb.close();
  });

  test.it("should properly commit successful transactions and rollback on failure", () => {
    const db = openDatabase(dbPath);

    const safeTx = db.transaction(() => {
      db.prepare("INSERT INTO records (value) VALUES (?)").run("tx-success");
      return "done";
    });
    const result = safeTx();
    assert.strictEqual(result, "done");

    const beforeFail = db.prepare("SELECT count(*) as cnt FROM records").get().cnt;

    const failingTx = db.transaction(() => {
      db.prepare("INSERT INTO records (value) VALUES (?)").run("tx-failed-row");
      throw new Error("Simulated failure in transaction");
    });

    assert.throws(() => {
      failingTx();
    }, /Simulated failure in transaction/);

    const afterFail = db.prepare("SELECT count(*) as cnt FROM records").get().cnt;
    assert.strictEqual(afterFail, beforeFail, "Rollback must ensure no partially applied rows persist");

    db.close();
  });

  test.it("should safely use checkpoint-and-copy fallback when VACUUM INTO fails", () => {
    const db = openDatabase(dbPath);
    const origExec = db.exec.bind(db);
    db.exec = (sql) => {
      if (typeof sql === "string" && sql.startsWith("VACUUM INTO")) {
        throw new Error("Simulated VACUUM INTO failure");
      }
      return origExec(sql);
    };

    const fallbackBackupPath = path.join(tmpDir, "fallback.sqlite.bak");
    const ok = backupDatabase(db, dbPath, fallbackBackupPath);
    assert.strictEqual(ok, true);
    assert.strictEqual(fs.existsSync(fallbackBackupPath), true);

    const verifyDb = openDatabase(fallbackBackupPath, { readonly: true });
    const count = verifyDb.prepare("SELECT count(*) as cnt FROM records").get();
    assert.ok(count.cnt >= 2, "Fallback backup must contain valid records");
    verifyDb.close();
    db.close();
  });

  test.it("should fail safely and preserve existing backup when WAL checkpoint is busy or fails", () => {
    assert.strictEqual(fs.existsSync(backupPath), true);

    const db = openDatabase(dbPath);
    const origExec = db.exec.bind(db);
    const origPrepare = db.prepare.bind(db);

    db.exec = (sql) => {
      if (typeof sql === "string" && sql.startsWith("VACUUM INTO")) {
        throw new Error("VACUUM INTO failed");
      }
      return origExec(sql);
    };
    db.prepare = (sql) => {
      if (typeof sql === "string" && sql.includes("wal_checkpoint")) {
        return { get: () => ({ busy: 1, log: 10, checkpointed: 0 }) };
      }
      return origPrepare(sql);
    };

    assert.throws(() => {
      backupDatabase(db, dbPath, backupPath);
    }, /checkpoint did not complete cleanly/);

    // Verify existing backup was NOT deleted or corrupted
    assert.strictEqual(fs.existsSync(backupPath), true, "Previous backup file must remain intact");
    const verifyDb = openDatabase(backupPath, { readonly: true });
    const check = verifyDb.prepare("PRAGMA quick_check").get();
    assert.strictEqual(Object.values(check)[0], "ok");
    verifyDb.close();

    db.close();
  });
});
