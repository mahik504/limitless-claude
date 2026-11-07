#!/usr/bin/env node
/**
 * Limitless Claude 7.0.0 - Universal Global CLI
 * 
 * Allows running Limitless Claude commands from ANY working directory:
 *   limitless launcher
 *   limitless dashboard
 *   limitless switch-profile --list
 *   limitless benchmark
 *   limitless rollback --list
 *   limitless setup
 *   limitless verify
 */

const path = require("path");
const { spawn } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SCRIPTS_DIR = path.join(PROJECT_ROOT, "scripts");

const COMMANDS = {
  launcher: path.join(SCRIPTS_DIR, "launcher.js"),
  dashboard: path.join(SCRIPTS_DIR, "dashboard.js"),
  "switch-profile": path.join(SCRIPTS_DIR, "switch-profile.js"),
  profile: path.join(SCRIPTS_DIR, "switch-profile.js"),
  benchmark: path.join(SCRIPTS_DIR, "benchmark.js"),
  rollback: path.join(SCRIPTS_DIR, "rollback.js"),
  setup: path.join(SCRIPTS_DIR, "setup.js"),
  verify: path.join(SCRIPTS_DIR, "verify-combos.js")
};

function printHelp() {
  console.log(`
================================================================================
           LIMITLESS CLAUDE 7.0.0 — UNIVERSAL GLOBAL CLI
================================================================================

Usage:
  limitless <command> [options]

Commands:
  launcher           Launch Claude Code under scoped profile (no registry pollution)
  dashboard          Open real-time terminal observability dashboard
  switch-profile     Switch provider profiles (limitless, native, opencode-go, etc.)
  benchmark          Run the 12-task standardized capability benchmark
  rollback           List or restore atomic configuration & database snapshots
  setup              Sync live OmniRoute models into intelligent composite tiers
  verify             Test live HTTP 200 connectivity across all 4 tiers

Examples:
  limitless launcher
  limitless dashboard --watch
  limitless switch-profile --list
  limitless switch-profile opencode-go
  limitless benchmark --target limitless-sonnet-5.5
  limitless rollback --latest
  limitless verify
================================================================================
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const subArgs = args.slice(1);

  if (!command || command === "--help" || command === "-h" || command === "help") {
    printHelp();
    process.exit(0);
  }

  if (command === "--version" || command === "-v" || command === "version") {
    const pkg = require(path.join(PROJECT_ROOT, "package.json"));
    console.log(`v${pkg.version}`);
    process.exit(0);
  }

  const scriptPath = COMMANDS[command];
  if (!scriptPath) {
    console.error(`\x1b[31m[ERROR] Unknown command: '${command}'\x1b[0m`);
    printHelp();
    process.exit(1);
  }

  const child = spawn(process.execPath, [scriptPath, ...subArgs], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
    env: process.env
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  child.on("error", (err) => {
    console.error(`\x1b[31m[ERROR] Failed to execute ${command}: ${err.message}\x1b[0m`);
    process.exit(1);
  });
}

main();
