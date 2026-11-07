#!/usr/bin/env node
/**
 * Limitless Claude 7.0 - Scoped Safe Launcher
 * 
 * Launches Claude Code with scoped environment variables without polluting
 * global or user environment registry.
 * 
 * Usage:
 *   node scripts/launcher.js [--profile <name>] [--] [claude-args...]
 */

const { spawn } = require("child_process");
const http = require("http");
const { defaultConfigManager } = require("../src/core/config-manager");
const { getProfile } = require("../src/profiles");
const { logger } = require("../src/utils/logger");

function printHelp() {
  console.log(`
Limitless Claude 7.0 - Scoped Process Launcher

Usage:
  node scripts/launcher.js [options] [--] [claude args...]

Options:
  --profile <name>  Execute with a specific profile without changing default
  --check-gateway   Verify local OmniRoute gateway is online before launch
  --help            Show this help message
`);
}

async function checkGateway(port = 20128) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: "/api/health",
      method: "GET",
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
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
  const args = process.argv.slice(2);
  let profileName = null;
  const claudeArgs = [];
  let checkGw = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--profile") {
      profileName = args[++i];
    } else if (arg === "--check-gateway") {
      checkGw = true;
    } else if (arg === "--") {
      claudeArgs.push(...args.slice(i + 1));
      break;
    } else {
      claudeArgs.push(arg);
    }
  }

  const activeProfileId = profileName || defaultConfigManager.getActiveProfile();
  const profile = getProfile(activeProfileId);
  if (!profile) {
    logger.error(`Unknown profile: ${activeProfileId}`);
    process.exit(1);
  }

  // If using limitless profile and gateway check requested, ensure gateway is listening
  if (profile.id === "limitless" && checkGw) {
    const isOnline = await checkGateway(20128);
    if (!isOnline) {
      logger.warn("OmniRoute gateway is not running on port 20128. Start it with: omniroute start");
    }
  }

  const scopedEnv = defaultConfigManager.getScopedEnv(profile.id);

  logger.info(`Launching Claude Code under profile [${profile.displayName}] (scoped process)...`);

  const cmd = process.platform === "win32" ? "claude.cmd" : "claude";
  const child = spawn(cmd, claudeArgs, {
    stdio: "inherit",
    env: scopedEnv,
    shell: true
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  child.on("error", (err) => {
    logger.error(`Failed to launch Claude Code executable: ${err.message}`);
    logger.info("Ensure '@anthropic-ai/claude-code' is installed globally: npm i -g @anthropic-ai/claude-code");
    process.exit(1);
  });
}

if (require.main === module) {
  main().catch(err => {
    logger.error(`Launcher failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
