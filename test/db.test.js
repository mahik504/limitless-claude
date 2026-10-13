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

  test.it("should fail candidate verification if candidate file has missing tables or rows compared to source", () => {
    assert.strictEqual(fs.existsSync(backupPath), true);
    const db = openDatabase(dbPath);

    // Force fallback path by failing VACUUM INTO, and simulate a copy that truncates/drops records
    const origExec = db.exec.bind(db);
    const origCopy = fs.copyFileSync.bind(fs);

    db.exec = (sql) => {
      if (typeof sql === "string" && sql.startsWith("VACUUM INTO")) {
        throw new Error("VACUUM INTO disabled for test");
      }
      return origExec(sql);
    };

    fs.copyFileSync = (src, dest) => {
      // Instead of copying the real DB, create an empty valid DB without the 'records' table
      const emptyDb = openDatabase(dest);
      emptyDb.exec("CREATE TABLE unrelated_empty (id INTEGER PRIMARY KEY);");
      emptyDb.close();
    };

    try {
      assert.throws(() => {
        backupDatabase(db, dbPath, backupPath);
      }, /missing table 'records'/);
    } finally {
      fs.copyFileSync = origCopy;
    }

    // Previous backup must remain intact
    assert.strictEqual(fs.existsSync(backupPath), true);
    const verifyDb = openDatabase(backupPath, { readonly: true });
    const count = verifyDb.prepare("SELECT count(*) as cnt FROM records").get();
    assert.ok(count.cnt >= 2);
    verifyDb.close();
    db.close();
  });

  test.it("should safely preserve and restore existing backup if candidate promotion fails", () => {
    assert.strictEqual(fs.existsSync(backupPath), true);
    const db = openDatabase(dbPath);

    const origRename = fs.renameSync.bind(fs);
    const origCopy = fs.copyFileSync.bind(fs);

    let renameAttempts = 0;
    fs.renameSync = (src, dest) => {
      renameAttempts++;
      // Allow staging rename (backupPath -> prevBackupPath), but fail promotion (candidatePath -> backupPath)
      if (src.includes(".candidate.")) {
        throw new Error("Simulated candidate promotion rename failure");
      }
      return origRename(src, dest);
    };

    fs.copyFileSync = (src, dest) => {
      if (src.includes(".candidate.")) {
        throw new Error("Simulated candidate promotion copy failure");
      }
      return origCopy(src, dest);
    };

    try {
      assert.throws(() => {
        backupDatabase(db, dbPath, backupPath);
      }, /Failed to promote verified backup candidate/);
    } finally {
      fs.renameSync = origRename;
      fs.copyFileSync = origCopy;
    }

    // Verify existing backup was restored to backupPath without loss and passes integrity check
    assert.strictEqual(fs.existsSync(backupPath), true, "Existing backup must be restored");
    const verifyDb = openDatabase(backupPath, { readonly: true });
    const count = verifyDb.prepare("SELECT count(*) as cnt FROM records").get();
    assert.ok(count.cnt >= 2);
    const check = verifyDb.prepare("PRAGMA quick_check").get();
    assert.strictEqual(Object.values(check)[0], "ok", "Restored backup must pass SQLite integrity check");
    verifyDb.close();
    db.close();
  });

  test.it("should clean up partial target file and restore intact previous backup if promotion copy fails partway", () => {
    assert.strictEqual(fs.existsSync(backupPath), true);
    const db = openDatabase(dbPath);

    const origRename = fs.renameSync.bind(fs);
    const origCopy = fs.copyFileSync.bind(fs);

    fs.renameSync = (src, dest) => {
      // Force promotion into copy fallback
      if (src.includes(".candidate.")) {
        throw new Error("Simulated candidate rename failure forcing copy fallback");
      }
      return origRename(src, dest);
    };

    fs.copyFileSync = (src, dest) => {
      if (src.includes(".candidate.")) {
        // Simulate partial write failure leaving a corrupt file at target destination
        fs.writeFileSync(dest, "CORRUPTED_PARTIAL_FILE_DATA");
        throw new Error("Simulated partial write failure during promotion copy");
      }
      return origCopy(src, dest);
    };

    try {
      assert.throws(() => {
        backupDatabase(db, dbPath, backupPath);
      }, /Failed to promote verified backup candidate/);
    } finally {
      fs.renameSync = origRename;
      fs.copyFileSync = origCopy;
    }

    // Previous backup must be restored intact, not overwritten by partial corrupted copy
    assert.strictEqual(fs.existsSync(backupPath), true, "Previous backup file must be restored");
    const verifyDb = openDatabase(backupPath, { readonly: true });
    const check = verifyDb.prepare("PRAGMA quick_check").get();
    assert.strictEqual(Object.values(check)[0], "ok", "Restored backup must pass SQLite integrity check");
    const count = verifyDb.prepare("SELECT count(*) as cnt FROM records").get();
    assert.ok(count.cnt >= 2, "Restored backup must have all original records");
    verifyDb.close();
    db.close();
  });
});
