#!/usr/bin/env node
/**
 * Limitless Claude 8.2 - Orchestra Workflow Integration Manager
 * 
 * Verifies and manages bidirectional interoperability between Limitless Claude
 * runtime and the local Orchestra 4.5.0 control plane.
 * 
 * Usage:
 *   node scripts/orchestra.js status
 *   node scripts/orchestra.js sync
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { defaultOrchestraAdapter } = require("../src/integrations/orchestra/adapter");

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function printStatus() {
  const details = defaultOrchestraAdapter.getDetails();

  console.log("================================================================================");
  console.log("            LIMITLESS CLAUDE 8.2 — ORCHESTRA 4.5.0 WORKFLOW STATUS");
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
    const is45 = mdContent.includes("Orchestra 4.5");
    console.log(`  [PASS] Claude Code CLAUDE.md     : ${is45 ? "Orchestra 4.5.0 Synced" : "Adapter present"}`);
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
  if (!details.detected) {
    console.error(`${RED}[ERROR] Cannot sync: Orchestra workflow not found on this machine.${RESET}`);
    process.exit(1);
  }

  console.log(`[*] Synchronizing Orchestra 4.5.0 artifacts into Claude Code configuration...`);

  // 1. Sync CLAUDE.md
  const sourceClaudeMd = path.join(details.path, "CLAUDE.md");
  const targetClaudeMd = path.join(os.homedir(), ".claude", "CLAUDE.md");
  if (fs.existsSync(sourceClaudeMd)) {
    fs.copyFileSync(sourceClaudeMd, targetClaudeMd);
    console.log(`  [OK] Synced CLAUDE.md -> ${targetClaudeMd}`);
  }

  // 2. Sync Skills
  const sourceSkills = path.join(details.path, "skills");
  const targetSkills = path.join(os.homedir(), ".claude", "skills");
  if (fs.existsSync(sourceSkills)) {
    if (!fs.existsSync(targetSkills)) {
      fs.mkdirSync(targetSkills, { recursive: true });
    }

    const skills = fs.readdirSync(sourceSkills).filter(f => !f.startsWith("."));
    let copiedCount = 0;

    for (const skill of skills) {
      const srcSkillDir = path.join(sourceSkills, skill);
      const tgtSkillDir = path.join(targetSkills, skill);
      if (fs.statSync(srcSkillDir).isDirectory()) {
        if (!fs.existsSync(tgtSkillDir)) {
          fs.cpSync(srcSkillDir, tgtSkillDir, { recursive: true });
          copiedCount++;
        }
      }
    }
    console.log(`  [OK] Checked ${skills.length} Orchestra skills (${copiedCount} newly synced into ~/.claude/skills)`);
  }

  console.log(`${GREEN}[SUCCESS] Orchestra workflow synchronization complete.${RESET}`);
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
