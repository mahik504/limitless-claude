#!/usr/bin/env node
/**
 * Limitless Claude 8.0.0 - Universal Global CLI
 * 
 * Allows running Limitless Claude commands from ANY working directory:
 *   limitless init
 *   limitless doctor
 *   limitless status
 *   limitless verify
 *   limitless models list [--free-only]
 *   limitless providers list
 *   limitless prompt compose --capability backend
 *   limitless budget
 *   limitless benchmark
 *   limitless acceptance
 *   limitless launcher
 *   limitless dashboard
 *   limitless rollback --list
 */

const path = require("path");
const { spawn } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SCRIPTS_DIR = path.join(PROJECT_ROOT, "scripts");

const COMMANDS = {
  init: path.join(SCRIPTS_DIR, "init.js"),
  doctor: path.join(SCRIPTS_DIR, "doctor.js"),
  status: path.join(SCRIPTS_DIR, "status.js"),
  verify: path.join(SCRIPTS_DIR, "verify-combos.js"),
  discover: path.join(SCRIPTS_DIR, "discover.js"),
  models: path.join(SCRIPTS_DIR, "models.js"),
  providers: path.join(SCRIPTS_DIR, "providers.js"),
  prompt: path.join(SCRIPTS_DIR, "prompt-cli.js"),
  budget: path.join(SCRIPTS_DIR, "budget.js"),
  usage: path.join(SCRIPTS_DIR, "budget.js"),
  launcher: path.join(SCRIPTS_DIR, "launcher.js"),
  dashboard: path.join(SCRIPTS_DIR, "dashboard.js"),
  "switch-profile": path.join(SCRIPTS_DIR, "switch-profile.js"),
  profile: path.join(SCRIPTS_DIR, "switch-profile.js"),
  benchmark: path.join(SCRIPTS_DIR, "benchmark.js"),
  rollback: path.join(SCRIPTS_DIR, "rollback.js"),
  backup: path.join(SCRIPTS_DIR, "rollback.js"),
  setup: path.join(SCRIPTS_DIR, "setup.js"),
  acceptance: path.join(SCRIPTS_DIR, "e2e-acceptance.js"),
  e2e: path.join(SCRIPTS_DIR, "e2e-acceptance.js"),
  pin: path.join(SCRIPTS_DIR, "pin.js"),
  undo: path.join(SCRIPTS_DIR, "undo.js"),
  checkpoint: path.join(SCRIPTS_DIR, "undo.js"),
  tui: path.join(SCRIPTS_DIR, "tui.js"),
  stats: path.join(SCRIPTS_DIR, "stats.js"),
  tokens: path.join(SCRIPTS_DIR, "stats.js"),
  orchestra: path.join(SCRIPTS_DIR, "orchestra.js")
};

function printHelp() {
  console.log(`
================================================================================
           LIMITLESS CLAUDE 8.2.0 — UNIVERSAL GLOBAL CLI
================================================================================

Usage:
  limitless <command> [options]

Core Operations:
  init               Zero-config initialization wizard & pre-setup validation
  doctor             Run 16-point system, gateway, and database diagnostics
  status             View active profile, gateway endpoint, and routing tiers
  verify             Test live HTTP 200 connectivity across all 4 tiers
  setup              Sync live OmniRoute models into intelligent composite tiers
  launcher           Launch Claude Code under scoped profile (no registry pollution)
  tui                Interactive real-time Terminal UI with live telemetry & latency
  stats (tokens)     Display real-time token volume and Anthropic cost savings

Model & Provider Intelligence:
  discover           Discover live models & providers (including local Ollama)
  models list        List catalogued models with lifecycle & billing filters
  models inspect     Inspect detailed capability profile of a model
  providers list     List connected providers, active states, and taxonomy
  providers test     Test gateway latency to connected inference providers
  pin                Pin specific models to task profiles (backend, frontend, etc.)

Orchestration & Workflow:
  orchestra status   Verify connection to local Orchestra 4.5.0 control plane
  orchestra sync     Sync Orchestra CLAUDE.md adapter and skills into ~/.claude/

Prompt Engineering & Budget:
  prompt list        List available 5-layer capability profiles & adapters
  prompt compose     Compose full 5-layer prompt with hash & section preview
  prompt test        Run Prompt Laboratory fixture regression suite
  budget             View spend controls and OpenRouter token capacity calculator

Benchmarks & Resilience:
  benchmark          Run the 12-task standardized capability benchmark
  acceptance         Run the 6-test End-to-End production acceptance suite
  dashboard          Open terminal observability dashboard
  rollback           List, inspect, or restore atomic database snapshots
  checkpoint         Snapshot files before editing (Cline-style file protection)
  undo               Instantly undo file changes from the last checkpoint

Examples:
  limitless doctor
  limitless verify
  limitless pin --task backend --model kiro/claude-sonnet-4.5
  limitless checkpoint --create "before auth edits" src/auth.js
  limitless undo
  limitless budget
  limitless benchmark --target limitless-sonnet-5.5
  limitless launcher
================================================================================
`);
}

const args = process.argv.slice(2);
const commandName = args[0];

if (!commandName || commandName === "--help" || commandName === "-h" || commandName === "help") {
  printHelp();
  process.exit(0);
}

if (!COMMANDS[commandName]) {
  console.error(`Unknown command: "${commandName}"`);
  console.error(`Run "limitless --help" for available commands.\n`);
  process.exit(1);
}

const scriptPath = COMMANDS[commandName];
const scriptArgs = args.slice(1);

const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
  stdio: "inherit",
  env: process.env
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
