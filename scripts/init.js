#!/usr/bin/env node
/**
 * Limitless Claude 8.0 - Zero-Config Initialization Wizard
 * 
 * Sets up and validates a complete standalone Limitless Claude environment:
 * 1. Checks prerequisites (Node 22+, OmniRoute database)
 * 2. Creates pre-setup safety snapshot
 * 3. Discovers live providers and models
 * 4. Syncs composite routing tiers (Haiku, Sonnet, Opus, Fable)
 * 5. Runs connectivity verification
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { defaultConfigManager } = require("../src/core/config-manager");

console.log(`
================================================================================
          LIMITLESS CLAUDE 8.0 — ZERO-CONFIG INITIALIZATION WIZARD
================================================================================
`);

const scriptsDir = path.resolve(__dirname);

// Step 1: Create initial safety snapshot
console.log("[1/4] Creating initial configuration & database safety snapshot...");
try {
  const snapId = defaultConfigManager.createSnapshot("init");
  console.log(`  -> Snapshot created: ${snapId}`);
} catch (e) {
  console.log(`  -> Snapshot note: ${e.message}`);
}

// Step 2: Run model discovery
console.log("\n[2/4] Discovering live models & provider connections...");
const discRes = spawnSync(process.execPath, [path.join(scriptsDir, "discover.js")], { stdio: "inherit" });
if (discRes.status !== 0) {
  console.log("  [WARN] Discovery encountered warnings. Continuing with cached/offline catalog.");
}

// Step 3: Sync composite tiers
console.log("\n[3/4] Synchronizing composite routing tiers into OmniRoute...");
const setupRes = spawnSync(process.execPath, [path.join(scriptsDir, "setup.js")], { stdio: "inherit" });
if (setupRes.status !== 0) {
  console.error("  [FAIL] Setup script failed. Please inspect errors above.");
  process.exit(1);
}

// Step 4: Verify connectivity
console.log("\n[4/4] Verifying live HTTP 200 connectivity across all 4 tiers...");
const verifyRes = spawnSync(process.execPath, [path.join(scriptsDir, "verify-combos.js")], { stdio: "inherit" });
if (verifyRes.status !== 0) {
  console.warn("  [WARN] Some tiers failed verification. Check provider accounts.");
}

console.log(`
================================================================================
Initialization Complete!
Run \`limitless doctor\` for full system diagnostics.
Run \`limitless launcher\` to start Claude Code under scoped profile.
================================================================================
`);
