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

  // 2. Remove previous backup file if it exists (VACUUM INTO requires target to not exist)
  if (fs.existsSync(backupPath)) {
    try {
      fs.unlinkSync(backupPath);
    } catch (_) {}
  }

  let backedUp = false;

  // 3. Preferred approach: SQLite consistent VACUUM INTO
  try {
    const normalizedTarget = backupPath.replace(/\\/g, "/").replace(/'/g, "''");
    db.exec(`VACUUM INTO '${normalizedTarget}';`);
    backedUp = true;
  } catch (err) {
    // VACUUM INTO might fail on certain file systems or read-only attachments
    backedUp = false;
  }

  // 4. Fallback approach: WAL full checkpoint followed by file copy
  if (!backedUp) {
    try {
      db.exec("PRAGMA wal_checkpoint(FULL);");
    } catch (_) {}
    fs.copyFileSync(dbPath, backupPath);
  }

  // 5. Verify backup integrity
  const verifyDb = openDatabase(backupPath, { readonly: true });
  try {
    const check = verifyDb.prepare("PRAGMA quick_check;").get();
    const resultVal = check ? Object.values(check)[0] : "ok";
    if (resultVal !== "ok") {
      throw new Error(`Backup quick_check returned: ${resultVal}`);
    }
  } finally {
    verifyDb.close();
  }

  return true;
}

module.exports = {
  openDatabase,
  backupDatabase
};
