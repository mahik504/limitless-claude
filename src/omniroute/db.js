const fs = require("fs");
const path = require("path");

let BetterSqlite3 = null;
try {
  BetterSqlite3 = require("better-sqlite3");
} catch (_) {
  BetterSqlite3 = null;
}

let NodeSqlite = null;
try {
  NodeSqlite = require("node:sqlite");
} catch (_) {
  NodeSqlite = null;
}

class NodeSqliteAdapter {
  constructor(dbPath, options = {}) {
    if (!NodeSqlite || !NodeSqlite.DatabaseSync) {
      throw new Error("Neither better-sqlite3 nor node:sqlite is available in this Node runtime.");
    }
    this.path = dbPath;
    this.readonly = !!options.readonly;
    this.db = new NodeSqlite.DatabaseSync(dbPath, { readOnly: this.readonly });
  }

  prepare(sql) {
    const stmt = this.db.prepare(sql);
    return {
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args),
      run: (...args) => stmt.run(...args)
    };
  }

  exec(sql) {
    return this.db.exec(sql);
  }

  pragma(pragmaStr) {
    const trimmed = pragmaStr.trim();
    if (trimmed.includes("=")) {
      this.db.exec(`PRAGMA ${trimmed};`);
      return [];
    }
    return this.db.prepare(`PRAGMA ${trimmed};`).all();
  }

  transaction(fn) {
    return (...args) => {
      this.db.exec("BEGIN IMMEDIATE");
      try {
        const result = fn(...args);
        this.db.exec("COMMIT");
        return result;
      } catch (err) {
        try {
          this.db.exec("ROLLBACK");
        } catch (_) {}
        throw err;
      }
    };
  }

  close() {
    this.db.close();
  }
}

class BetterSqliteAdapter {
  constructor(dbPath, options = {}) {
    this.path = dbPath;
    this.readonly = !!options.readonly;
    this.db = new BetterSqlite3(dbPath, options);
  }

  prepare(sql) {
    const stmt = this.db.prepare(sql);
    return {
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args),
      run: (...args) => stmt.run(...args)
    };
  }

  exec(sql) {
    return this.db.exec(sql);
  }

  pragma(pragmaStr) {
    return this.db.pragma(pragmaStr);
  }

  transaction(fn) {
    return this.db.transaction(fn);
  }

  close() {
    this.db.close();
  }
}

function openDatabase(dbPath, options = {}) {
  // If better-sqlite3 is installed and functioning, prefer it for backward compatibility;
  // otherwise seamlessly use built-in node:sqlite.
  if (BetterSqlite3) {
    try {
      return new BetterSqliteAdapter(dbPath, options);
    } catch (_) {
      // Fall through to NodeSqliteAdapter if better-sqlite3 fails at runtime
    }
  }

  if (NodeSqlite && NodeSqlite.DatabaseSync) {
    return new NodeSqliteAdapter(dbPath, options);
  }

  throw new Error("Unable to initialize SQLite database: no supported SQLite driver found.");
}

function backupDatabase(db, dbPath, backupPath) {
  // 1. Ensure target directory exists
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });

  // 2. Use an isolated candidate file so any existing valid backup is NEVER deleted before verification
  const candidatePath = `${backupPath}.candidate.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  if (fs.existsSync(candidatePath)) {
    try { fs.unlinkSync(candidatePath); } catch (_) {}
  }

  let backedUp = false;

  // 3. Preferred approach: SQLite consistent VACUUM INTO
  try {
    const normalizedTarget = candidatePath.replace(/\\/g, "/").replace(/'/g, "''");
    db.exec(`VACUUM INTO '${normalizedTarget}';`);
    backedUp = true;
  } catch (err) {
    // VACUUM INTO may fail on older engines, permission constraints, or read-only attachments
    backedUp = false;
  }

  // 4. Fallback approach: WAL full checkpoint followed by file copy
  if (!backedUp) {
    let checkpointOk = false;
    try {
      const res = db.prepare("PRAGMA wal_checkpoint(FULL);").get();
      const busyVal = res ? (res.busy !== undefined ? res.busy : Object.values(res)[0]) : 0;
      if (busyVal === 0) {
        checkpointOk = true;
      }
    } catch (_) {
      checkpointOk = false;
    }

    if (!checkpointOk) {
      if (fs.existsSync(candidatePath)) {
        try { fs.unlinkSync(candidatePath); } catch (_) {}
      }
      throw new Error("SQLite backup fallback failed: WAL checkpoint did not complete cleanly (busy or locked). Existing backup preserved.");
    }

    try {
      fs.copyFileSync(dbPath, candidatePath);
    } catch (copyErr) {
      if (fs.existsSync(candidatePath)) {
        try { fs.unlinkSync(candidatePath); } catch (_) {}
      }
      throw new Error(`SQLite backup fallback failed to copy database file: ${copyErr.message}. Existing backup preserved.`);
    }
  }

  // 5. Verify candidate backup integrity and data consistency in complete isolation
  let verifyDb;
  try {
    verifyDb = openDatabase(candidatePath, { readonly: true });
    const check = verifyDb.prepare("PRAGMA quick_check;").get();
    const resultVal = check ? Object.values(check)[0] : "ok";
    if (resultVal !== "ok") {
      throw new Error(`Backup quick_check returned: ${resultVal}`);
    }

    // Verify expected tables and rows from source database are present in candidate
    const sourceTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);
    const candidateTables = verifyDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);
    for (const tbl of sourceTables) {
      if (!candidateTables.includes(tbl)) {
        throw new Error(`missing table '${tbl}'`);
      }
      const srcCount = db.prepare(`SELECT count(*) as cnt FROM "${tbl}"`).get().cnt;
      const candCount = verifyDb.prepare(`SELECT count(*) as cnt FROM "${tbl}"`).get().cnt;
      if (candCount < srcCount) {
        throw new Error(`table '${tbl}' has fewer rows (${candCount}) than source database (${srcCount})`);
      }
    }
  } catch (verifyErr) {
    if (verifyDb) {
      try { verifyDb.close(); } catch (_) {}
      verifyDb = null;
    }
    if (fs.existsSync(candidatePath)) {
      try { fs.unlinkSync(candidatePath); } catch (_) {}
    }
    throw new Error(`Backup verification failed: ${verifyErr.message}. Existing backup preserved.`);
  } finally {
    if (verifyDb) {
      try { verifyDb.close(); } catch (_) {}
    }
  }

  // 6. Safe atomic replacement: preserve previous backup until candidate is safely in place
  const prevBackupPath = fs.existsSync(backupPath) ? `${backupPath}.prev.${Date.now()}.${Math.random().toString(36).slice(2, 8)}` : null;
  if (prevBackupPath) {
    try {
      fs.renameSync(backupPath, prevBackupPath);
    } catch (movePrevErr) {
      if (fs.existsSync(candidatePath)) {
        try { fs.unlinkSync(candidatePath); } catch (_) {}
      }
      throw new Error(`Failed to stage existing backup before promotion: ${movePrevErr.message}. Existing backup preserved.`);
    }
  }

  let promoted = false;
  try {
    fs.renameSync(candidatePath, backupPath);
    promoted = true;
  } catch (replaceErr) {
    try {
      fs.copyFileSync(candidatePath, backupPath);
      try { fs.unlinkSync(candidatePath); } catch (_) {}
      promoted = true;
    } catch (copyFallbackErr) {
      if (prevBackupPath && fs.existsSync(prevBackupPath)) {
        try { fs.renameSync(prevBackupPath, backupPath); } catch (_) {}
      }
      if (fs.existsSync(candidatePath)) {
        try { fs.unlinkSync(candidatePath); } catch (_) {}
      }
      throw new Error(`Failed to promote verified backup candidate to target path: ${copyFallbackErr.message}. Previous backup preserved.`);
    }
  }

  if (promoted && prevBackupPath && fs.existsSync(prevBackupPath)) {
    try { fs.unlinkSync(prevBackupPath); } catch (_) {}
  }

  return true;
}

module.exports = {
  openDatabase,
  backupDatabase
};
