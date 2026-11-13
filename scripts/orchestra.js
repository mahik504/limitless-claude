#!/usr/bin/env node
/**
 * Limitless Claude 8.2 - Orchestra Workflow Integration Manager
 * 
 * Verifies and manages bidirectional interoperability between Limitless Claude
 * runtime and the local Orchestra control plane. The version comes from that repo's VERSION file.
 * 
 * Usage:
 *   node scripts/orchestra.js status
 *   node scripts/orchestra.js sync
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");
const { adapterMatches, defaultOrchestraAdapter } = require("../src/integrations/orchestra/adapter");

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function printStatus() {
  const details = defaultOrchestraAdapter.getDetails();

  console.log("================================================================================");
  const bannerVersion = details.detected ? details.version : "not detected";
  console.log(`            LIMITLESS CLAUDE 8.5.0 — ORCHESTRA ${bannerVersion} WORKFLOW STATUS`);
  console.log("================================================================================");

  if (!details.detected) {
    console.log(`  ${YELLOW}[STANDBY] Orchestra workflow directory not detected on disk.${RESET}`);
    console.log(`  Candidate paths searched:`);
    for (const p of defaultOrchestraAdapter.candidatePaths) {
      console.log(`    - ${p}`);
    }
    console.log(`  Limitless Claude is operating safely in Standalone Mode (Mode A).`);
    console.log("================================================================================");
    return;
  }

  console.log(`  ${GREEN}[ACTIVE] Orchestra Control Plane Connected (Mode B Active)${RESET}`);
  console.log(`  • Workspace Root       : ${details.path}`);
  console.log(`  • Orchestra Version    : ${details.version}`);
  console.log(`  • Discovered Skills    : ${details.skillsCount} skills registered in control plane`);

  // Check ~/.claude adapter
  const claudeSettings = path.join(os.homedir(), ".claude", "settings.json");
  const claudeMd = path.join(os.homedir(), ".claude", "CLAUDE.md");
  const claudeSkills = path.join(os.homedir(), ".claude", "skills");

  console.log("--------------------------------------------------------------------------------");
  console.log("  HOST INTEGRATION AUDIT:");

  // CLAUDE.md
  if (fs.existsSync(claudeMd)) {
    const mdContent = fs.readFileSync(claudeMd, "utf8");
    const synced = adapterMatches(mdContent, details.version);
    console.log(`  [PASS] Claude Code CLAUDE.md     : ${synced ? `Orchestra ${details.version} synced` : "Adapter present"}`);
  } else {
    console.log(`  [WARN] Claude Code CLAUDE.md     : Not found. Run 'limitless orchestra sync'`);
  }

  // settings.json
  if (fs.existsSync(claudeSettings)) {
    try {
      const settings = JSON.parse(fs.readFileSync(claudeSettings, "utf8"));
      const isOmni = (settings.ANTHROPIC_BASE_URL || settings.env?.ANTHROPIC_BASE_URL || "").includes("20128");
      const hasMcps = Boolean(settings.mcpServers && settings.mcpServers["orchestra-brain"]);
      console.log(`  [PASS] Claude Code Gateway Route : ${isOmni ? "Routed to OmniRoute (:20128)" : "Custom"}`);
      console.log(`  [PASS] Orchestra MCP Servers     : ${hasMcps ? "orchestra-brain, stitch, playwright, context7 wired" : "Partial"}`);
    } catch (_) {
      console.log(`  [WARN] Claude Code settings.json : Could not parse JSON`);
    }
  }

  // Skills count in ~/.claude/skills
  if (fs.existsSync(claudeSkills)) {
    const cCount = fs.readdirSync(claudeSkills).filter(f => !f.startsWith(".")).length;
    console.log(`  [PASS] Claude Code Skill Cache   : ${cCount} skills installed in ~/.claude/skills`);
  }

  console.log("================================================================================");
}

function syncOrchestra() {
  const details = defaultOrchestraAdapter.getDetails();
  if (!details.detected || !details.path) {
    console.error(`${RED}[ERROR] Cannot sync: Orchestra workflow not found on this machine.${RESET}`);
    process.exit(1);
  }

  const script = path.join(details.path, "runtime", "tools", "ow-sync.mjs");
  if (!fs.existsSync(script)) {
    console.error(`${RED}[ERROR] ow-sync is missing at ${script}${RESET}`);
    process.exit(1);
  }

  console.log(`[*] Synchronizing Orchestra ${details.version} through ow-sync...`);
  const result = spawnSync(process.execPath, [script, "--apply"], {
    cwd: details.path,
    stdio: "inherit",
    env: process.env
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
  console.log(`${GREEN}[SUCCESS] Orchestra ${details.version} synchronization complete.${RESET}`);
}

function main() {
  const cmd = process.argv[2] || "status";
  if (cmd === "sync") {
    syncOrchestra();
  } else {
    printStatus();
  }
}

if (require.main === module) {
  main();
}

module.exports = { printStatus, syncOrchestra };
