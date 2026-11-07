#!/usr/bin/env node
/**
 * Limitless Claude 8.1 - Zero-Config Self-Healing Initialization Wizard
 * 
 * Automatically provisions, heals, and configures a complete Limitless Claude setup:
 * 1. Checks Node.js runtime (>= 22 required)
 * 2. Checks/launches OmniRoute gateway daemon if stopped
 * 3. Ensures SQLite database exists and auto-provisions local API key if none present
 * 4. Configures ~/.claude/settings.json for instant Claude Code interop
 * 5. Captures WAL-safe safety snapshot
 * 6. Discovers connected providers and models
 * 7. Synchronizes 4 composite routing tiers (Haiku, Sonnet, Opus, Fable)
 * 8. Verifies live HTTP 200 connectivity across all tiers
 */

const { spawnSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const http = require("http");
const crypto = require("crypto");
const { openDatabase } = require("../src/omniroute/db");
const { defaultConfigManager } = require("../src/core/config-manager");

console.log(`
================================================================================
          LIMITLESS CLAUDE 8.1 — ZERO-CONFIG INITIALIZATION WIZARD
================================================================================
`);

// 1. Runtime Version Check
const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor < 22) {
  console.error(`[FAIL] Node.js version v${process.version} detected. Node.js >= 22 is required.`);
  console.error("Please upgrade Node.js from https://nodejs.org to continue.");
  process.exit(1);
}
console.log(`[PASS] Node.js runtime version: v${process.version}`);

const scriptsDir = path.resolve(__dirname);
const omnirouteDir = process.env.OMNIROUTE_DIR || path.join(os.homedir(), ".omniroute");
const dbPath = path.join(omnirouteDir, "storage.sqlite");

// Helper to check HTTP reachability
function checkGatewayPing(port = 20128, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: "/v1/models",
      method: "GET",
      timeout: timeoutMs
    }, (res) => {
      resolve(true); // Any response means port is open and gateway is active
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function main() {
  const cliArgs = process.argv.slice(2);
  const isFreeOnly = cliArgs.includes("--free-only") || cliArgs.includes("--exclude-paid");

  // Step 1: Ensure ~/.omniroute directory and database exist
  console.log("\n[1/6] Checking OmniRoute storage and database...");
  if (!fs.existsSync(omnirouteDir)) {
    fs.mkdirSync(omnirouteDir, { recursive: true });
    console.log(`  -> Created OmniRoute directory: ${omnirouteDir}`);
  }

  let db;
  let hasCreatedTables = false;
  try {
    db = openDatabase(dbPath, { readonly: false });
    db.pragma("busy_timeout = 8000");

    // Ensure minimal required schema exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        key TEXT PRIMARY KEY,
        name TEXT,
        model_access_mode TEXT DEFAULT 'all',
        allowed_models TEXT DEFAULT '[]',
        allowed_combos TEXT DEFAULT '["combo/*"]',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME,
        expires_at DATETIME
      );
      CREATE TABLE IF NOT EXISTS combos (
        id TEXT PRIMARY KEY,
        name TEXT,
        data TEXT,
        system_message TEXT,
        created_at DATETIME,
        updated_at DATETIME
      );
      CREATE TABLE IF NOT EXISTS model_combo_mappings (
        id TEXT PRIMARY KEY,
        pattern TEXT,
        combo_id TEXT,
        priority INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1,
        description TEXT,
        created_at DATETIME,
        updated_at DATETIME
      );
    `);
    console.log("  -> OmniRoute SQLite database verified (WAL mode enabled)");
  } catch (err) {
    console.error(`  [WARN] Database check error: ${err.message}`);
  }

  // Step 2: Auto-Provision API Key if missing
  console.log("\n[2/6] Checking API Key authorization...");
  let activeKey = null;
  if (db) {
    try {
      const existing = db.prepare("SELECT key, model_access_mode FROM api_keys WHERE is_active = 1 LIMIT 1").get();
      if (existing) {
        activeKey = existing.key;
        console.log(`  -> Active OmniRoute API key found: ${activeKey.slice(0, 10)}...`);
      } else {
        activeKey = `sk-ant-limitless-${crypto.randomBytes(16).toString("hex")}`;
        db.prepare(`
          INSERT INTO api_keys (key, name, model_access_mode, allowed_models, allowed_combos, is_active, created_at)
          VALUES (?, 'Limitless Claude Local Key', 'all', '[]', '["combo/*"]', 1, datetime('now'))
        `).run(activeKey);
        console.log(`  -> Auto-provisioned new local API key: ${activeKey.slice(0, 10)}...`);
      }
    } catch (e) {
      console.warn(`  [WARN] Key check error: ${e.message}`);
    } finally {
      db.close();
    }
  }

  // Configure Claude Code settings automatically if key is available
  if (activeKey) {
    try {
      const claudeDir = path.join(os.homedir(), ".claude");
      const settingsPath = path.join(claudeDir, "settings.json");
      if (!fs.existsSync(claudeDir)) {
        fs.mkdirSync(claudeDir, { recursive: true });
      }

      let settings = {};
      if (fs.existsSync(settingsPath)) {
        try {
          settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        } catch (_) {}
      }

      settings.env = settings.env || {};
      settings.env.ANTHROPIC_AUTH_TOKEN = activeKey;
      settings.env.ANTHROPIC_BASE_URL = "http://localhost:20128";
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");
      console.log("  -> Configured ~/.claude/settings.json with local OmniRoute credentials");
    } catch (err) {
      console.warn(`  [WARN] Could not update ~/.claude/settings.json: ${err.message}`);
    }
  }

  // Step 3: Check / Launch Gateway
  console.log("\n[3/6] Checking OmniRoute Gateway connectivity (127.0.0.1:20128)...");
  let isGatewayAlive = await checkGatewayPing(20128, 1200);

  if (!isGatewayAlive) {
    console.log("  -> Gateway not responding on port 20128. Attempting auto-launch...");
    const daemonBat = path.join(scriptsDir, "omniroute-daemon.bat");
    if (fs.existsSync(daemonBat)) {
      try {
        spawn("cmd.exe", ["/c", daemonBat], { detached: true, stdio: "ignore" }).unref();
      } catch (_) {}
    } else {
      try {
        spawn("omniroute", ["serve"], { detached: true, stdio: "ignore" }).unref();
      } catch (_) {}
    }

    // Wait up to 5 seconds for gateway to come alive
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 1000));
      isGatewayAlive = await checkGatewayPing(20128, 1000);
      if (isGatewayAlive) break;
    }
  }

  if (isGatewayAlive) {
    console.log("  -> OmniRoute gateway is active on http://127.0.0.1:20128");
  } else {
    console.warn("  [WARN] OmniRoute gateway is not running yet.");
    console.warn("         Please open OmniRoute from your Windows system tray or run `omniroute serve`.");
    console.warn("         Setup will proceed using offline cached model inventory.");
  }

  // Step 4: Create safety snapshot
  console.log("\n[4/6] Creating initial configuration & database safety snapshot...");
  try {
    const snapId = defaultConfigManager.createSnapshot("init");
    console.log(`  -> Snapshot created: ${snapId}`);
  } catch (e) {
    console.log(`  -> Snapshot note: ${e.message}`);
  }

  // Step 5: Run model discovery & tier sync
  console.log("\n[5/6] Discovering providers and synchronizing composite tiers...");
  const discArgs = [path.join(scriptsDir, "discover.js")];
  const discRes = spawnSync(process.execPath, discArgs, { stdio: "inherit" });
  if (discRes.status !== 0) {
    console.log("  [WARN] Live discovery encountered warnings. Proceeding with offline inventory.");
  }

  const setupArgs = [path.join(scriptsDir, "setup.js"), "--allow-offline-catalog"];
  if (isFreeOnly) {
    setupArgs.push("--free-only");
  }
  const setupRes = spawnSync(process.execPath, setupArgs, { stdio: "inherit" });
  if (setupRes.status !== 0) {
    console.error("  [FAIL] Tier setup failed. Inspect logs above.");
    process.exit(1);
  }

  // Step 6: Verify connectivity
  console.log("\n[6/6] Verifying live HTTP 200 connectivity across all 4 tiers...");
  const verifyRes = spawnSync(process.execPath, [path.join(scriptsDir, "verify-combos.js")], { stdio: "inherit" });
  if (verifyRes.status !== 0) {
    console.warn("  [WARN] One or more tiers require connected provider credentials in OmniRoute.");
    console.warn("         Connect free providers (Groq, Cloudflare, OpenRouter) in http://localhost:20128");
  }

  console.log(`
================================================================================
Initialization Complete!
Run \`limitless doctor\` for full system diagnostics.
Run \`limitless launcher\` to start Claude Code under scoped profile.
Run \`limitless pin --list\` to inspect active task-to-model pin overrides.
================================================================================
`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Initialization wizard error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
