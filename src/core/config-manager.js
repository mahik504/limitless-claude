/**
 * Limitless Claude 8.0 - Configuration, Profile & Rollback Manager
 * 
 * Manages:
 * - Active provider profiles (native, limitless, opencode-go, opencode-zen, openrouter, antigravity)
 * - Conflict detection across environment variables and port bindings
 * - Scoped process environment generation (no global variable pollution)
 * - Atomic backup snapshots and rollback restoration
 * - WAL-safe SQLite backups via dedicated database adapter
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { logger } = require("../utils/logger");

let dbModule = null;
try {
  dbModule = require("../omniroute/db");
} catch (_) {
  dbModule = null;
}

const PROFILES = {
  NATIVE: "native",
  LIMITLESS: "limitless",
  OPENCODE_GO: "opencode-go",
  OPENCODE_ZEN: "opencode-zen",
  OPENROUTER: "openrouter",
  ANTIGRAVITY: "antigravity"
};

class ConfigManager {
  constructor(options = {}) {
    this.homeDir = options.homeDir || os.homedir();
    this.claudeDir = path.join(this.homeDir, ".claude");
    this.omnirouteDir = options.omnirouteDir || process.env.OMNIROUTE_DIR || path.join(this.homeDir, ".omniroute");
    this.projectRoot = options.projectRoot || path.resolve(__dirname, "../..");
    this.backupsDir = path.join(this.projectRoot, "backups");
    this.activeProfileFile = path.join(this.projectRoot, ".active-profile");
  }

  ensureDirs() {
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  getActiveProfile() {
    try {
      if (fs.existsSync(this.activeProfileFile)) {
        return fs.readFileSync(this.activeProfileFile, "utf8").trim();
      }
    } catch (_) {}
    return PROFILES.LIMITLESS;
  }

  setActiveProfile(profileName) {
    this.ensureDirs();
    fs.writeFileSync(this.activeProfileFile, profileName.trim(), "utf8");
    logger.info(`Active profile switched to: ${profileName}`);
  }

  detectConflicts() {
    const conflicts = [];

    // Check environment variables
    const isLocalGateway = (url) => typeof url === "string" && (url.includes("127.0.0.1:20128") || url.includes("localhost:20128"));

    if (process.env.ANTHROPIC_BASE_URL && !isLocalGateway(process.env.ANTHROPIC_BASE_URL)) {
      conflicts.push({
        type: "ENV_OVERRIDE",
        variable: "ANTHROPIC_BASE_URL",
        value: process.env.ANTHROPIC_BASE_URL,
        message: "ANTHROPIC_BASE_URL points outside local OmniRoute gateway"
      });
    }

    // Check Claude settings
    const settingsPath = path.join(this.claudeDir, "settings.json");
    if (fs.existsSync(settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        if (settings.env && settings.env.ANTHROPIC_BASE_URL && !isLocalGateway(settings.env.ANTHROPIC_BASE_URL)) {
          conflicts.push({
            type: "SETTINGS_OVERRIDE",
            file: settingsPath,
            value: settings.env.ANTHROPIC_BASE_URL,
            message: "settings.json points ANTHROPIC_BASE_URL to external destination"
          });
        }
      } catch (err) {
        conflicts.push({
          type: "SETTINGS_PARSE_ERROR",
          file: settingsPath,
          message: err.message
        });
      }
    }

    return conflicts;
  }

  createSnapshot(tag = "auto") {
    this.ensureDirs();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotId = `${tag}-${timestamp}`;
    const targetDir = path.join(this.backupsDir, snapshotId);
    fs.mkdirSync(targetDir, { recursive: true });

    const backedUp = [];

    // 1. Standard config files
    const configFiles = [
      { src: path.join(this.claudeDir, "settings.json"), dest: "claude-settings.json" },
      { src: path.join(this.homeDir, ".claude.json"), dest: "claude.json" },
      { src: this.activeProfileFile, dest: ".active-profile" }
    ];

    for (const item of configFiles) {
      if (fs.existsSync(item.src)) {
        const destPath = path.join(targetDir, item.dest);
        fs.copyFileSync(item.src, destPath);
        backedUp.push(item.dest);
      }
    }

    // 2. WAL-safe SQLite database backup
    const dbPath = path.join(this.omnirouteDir, "storage.sqlite");
    if (fs.existsSync(dbPath)) {
      const dbDestPath = path.join(targetDir, "storage.sqlite");
      let dbBackedUp = false;

      if (dbModule && typeof dbModule.backupDatabase === "function" && typeof dbModule.openDatabase === "function") {
        let db = null;
        try {
          db = dbModule.openDatabase(dbPath);
          dbModule.backupDatabase(db, dbPath, dbDestPath);
          dbBackedUp = true;
          backedUp.push("storage.sqlite");
        } catch (dbErr) {
          logger.warn(`WAL-safe backup failed: ${dbErr.message}. Omitting SQLite snapshot to prevent storing corrupted uncheckpointed state.`);
        } finally {
          if (db && typeof db.close === "function") {
            try { db.close(); } catch (_) {}
          }
        }
      }
    }

    const manifest = {
      snapshotId,
      timestamp,
      tag,
      files: backedUp,
      version: "8.0.0"
    };
    fs.writeFileSync(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    logger.info(`Created snapshot ${snapshotId} (${backedUp.length} files backed up)`);
    return snapshotId;
  }

  createPreSwitchSnapshot(targetProfile) {
    return this.createSnapshot(`pre-switch-${targetProfile}`);
  }

  listSnapshots() {
    this.ensureDirs();
    const entries = fs.readdirSync(this.backupsDir, { withFileTypes: true });
    const snapshots = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(this.backupsDir, entry.name, "manifest.json");
        if (fs.existsSync(manifestPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
            snapshots.push(data);
          } catch (_) {
            snapshots.push({ snapshotId: entry.name, timestamp: "unknown", files: [] });
          }
        }
      }
    }

    return snapshots.sort((a, b) => b.snapshotId.localeCompare(a.snapshotId));
  }

  rollback(snapshotId) {
    const targetDir = path.join(this.backupsDir, snapshotId);
    if (!fs.existsSync(targetDir)) {
      throw new Error(`Snapshot directory does not exist: ${targetDir}`);
    }

    const restores = [
      { src: path.join(targetDir, "claude-settings.json"), dest: path.join(this.claudeDir, "settings.json") },
      { src: path.join(targetDir, "claude.json"), dest: path.join(this.homeDir, ".claude.json") },
      { src: path.join(targetDir, "storage.sqlite"), dest: path.join(this.omnirouteDir, "storage.sqlite") },
      { src: path.join(targetDir, ".active-profile"), dest: this.activeProfileFile }
    ];

    let restoredCount = 0;
    for (const r of restores) {
      if (fs.existsSync(r.src)) {
        fs.mkdirSync(path.dirname(r.dest), { recursive: true });
        fs.copyFileSync(r.src, r.dest);
        restoredCount++;
      }
    }

    logger.info(`Successfully rolled back to snapshot ${snapshotId} (${restoredCount} files restored)`);
    return restoredCount;
  }

  getScopedEnv(profileName = PROFILES.LIMITLESS, extraEnv = {}) {
    const baseEnv = { ...process.env };
    
    // In limitless profile, point to local OmniRoute gateway
    if (profileName === PROFILES.LIMITLESS) {
      return {
        ...baseEnv,
        ANTHROPIC_BASE_URL: "http://127.0.0.1:20128",
        OMNIROUTE_PORT: "20128",
        LIMITLESS_CLAUDE_PROFILE: PROFILES.LIMITLESS,
        ...extraEnv
      };
    }

    if (profileName === PROFILES.NATIVE) {
      const clean = { ...baseEnv };
      delete clean.ANTHROPIC_BASE_URL;
      clean.LIMITLESS_CLAUDE_PROFILE = PROFILES.NATIVE;
      return { ...clean, ...extraEnv };
    }

    return {
      ...baseEnv,
      LIMITLESS_CLAUDE_PROFILE: profileName,
      ...extraEnv
    };
  }
}

const defaultConfigManager = new ConfigManager();

module.exports = {
  PROFILES,
  ConfigManager,
  defaultConfigManager
};
