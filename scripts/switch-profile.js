#!/usr/bin/env node
/**
 * Limitless Claude 7.0 - Profile Switcher CLI
 * 
 * Usage:
 *   node scripts/switch-profile.js --list
 *   node scripts/switch-profile.js <profile-name> [--dry-run]
 * 
 * Profiles:
 *   native        - Official Anthropic API
 *   limitless     - Local OmniRoute intelligent multi-provider router
 *   opencode-go   - OpenCode Go subscription
 *   opencode-zen  - OpenCode Zen metered
 *   openrouter    - OpenRouter API hub
 *   antigravity   - Antigravity Google One AI
 */

const fs = require("fs");
const path = require("path");
const { defaultConfigManager } = require("../src/core/config-manager");
const { listProfiles, getProfile } = require("../src/profiles");
const { logger } = require("../src/utils/logger");

function printHelp() {
  console.log(`
Limitless Claude 7.0 - Profile Switcher

Usage:
  node scripts/switch-profile.js [profile-name] [options]

Available Profiles:`);
  for (const p of listProfiles()) {
    console.log(`  - ${p.id.padEnd(14)} : ${p.displayName} (${p.description})`);
  }
  console.log(`
Options:
  --list       List all supported profiles with active status
  --dry-run    Simulate profile switch without writing configuration files
  --help       Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  const isHelp = args.includes("--help") || args.includes("-h");
  const isList = args.includes("--list");
  const isDryRun = args.includes("--dry-run");

  if (isHelp) {
    printHelp();
    process.exit(0);
  }

  const activeProfile = defaultConfigManager.getActiveProfile();

  if (isList || args.length === 0) {
    console.log("\n=======================================================");
    console.log("       LIMITLESS CLAUDE 7.0 - PROVIDER PROFILES");
    console.log("=======================================================\n");
    console.log(`Current Active Profile: [${activeProfile.toUpperCase()}]\n`);
    for (const p of listProfiles()) {
      const mark = p.id === activeProfile ? "-> (ACTIVE)" : "  ";
      console.log(`${mark} ${p.id.padEnd(14)} : ${p.displayName}`);
      console.log(`     Target URL    : ${p.targetBaseUrl}`);
      console.log(`     Billing Type  : ${p.billingType}\n`);
    }
    process.exit(0);
  }

  const targetProfileId = args.find(a => !a.startsWith("--"));
  if (!targetProfileId) {
    printHelp();
    process.exit(1);
  }

  const profile = getProfile(targetProfileId);
  if (!profile) {
    logger.error(`Unknown profile: '${targetProfileId}'. Run with --list to see supported profiles.`);
    process.exit(1);
  }

  logger.info(`Switching profile from [${activeProfile}] to [${profile.id}]...`);

  if (isDryRun) {
    logger.info(`[DRY-RUN] Profile switch to ${profile.id} simulated successfully. No files mutated.`);
    process.exit(0);
  }

  // 1. Create pre-switch snapshot
  const snapshotId = defaultConfigManager.createSnapshot(`pre-switch-${profile.id}`);
  logger.info(`Pre-switch snapshot created: ${snapshotId}`);

  // 2. Update ~/.claude/settings.json
  const settingsPath = path.join(defaultConfigManager.claudeDir, "settings.json");
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch (_) {
      settings = {};
    }
  }

  if (!settings.env) settings.env = {};

  if (profile.id === "native") {
    delete settings.env.ANTHROPIC_BASE_URL;
  } else {
    settings.env.ANTHROPIC_BASE_URL = profile.targetBaseUrl;
  }

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");

  // 3. Update active profile marker
  defaultConfigManager.setActiveProfile(profile.id);

  console.log("\n=======================================================");
  console.log(` [SUCCESS] Switched to profile: ${profile.displayName}`);
  console.log("=======================================================");
  console.log(`Base URL: ${profile.targetBaseUrl}`);
  console.log(`Billing : ${profile.billingType}\n`);
  console.log("Setup Instructions:");
  for (const step of profile.setupInstructions || []) {
    console.log(`  * ${step}`);
  }
  console.log("");
}

if (require.main === module) {
  main().catch(err => {
    logger.error(`Profile switch failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
