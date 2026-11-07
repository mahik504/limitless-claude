#!/usr/bin/env node
/**
 * Limitless Claude 8.2 - Interactive Terminal TUI Dashboard
 * 
 * High-performance terminal dashboard with real-time gateway health, latency meters,
 * model tier pools, upstream provider states, task pins, and token cost telemetry.
 * 
 * Usage:
 *   node scripts/tui.js [--once] [--json]
 */

const http = require("http");
const readline = require("readline");
const { getDatabase } = require("../src/omniroute/db");
const { defaultConfigManager } = require("../src/core/config-manager");
const { defaultTaskPinManager } = require("../src/core/task-pins");
const { defaultTokenTracker } = require("../src/core/token-tracker");
const { defaultOllamaDiscovery } = require("../src/core/ollama-discovery");

// Terminal ANSI Styles
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const RED = "\x1b[31m";
const WHITE = "\x1b[37m";

async function pingGateway(port = 20128) {
  const start = Date.now();
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: "/api/health",
      method: "GET",
      timeout: 1500
    }, (res) => {
      const elapsed = Date.now() - start;
      resolve({
        online: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode,
        latencyMs: elapsed
      });
    });

    req.on("error", () => resolve({ online: false, statusCode: 0, latencyMs: 0 }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ online: false, statusCode: 0, latencyMs: 0 });
    });
    req.end();
  });
}

function renderScreen(data) {
  const { gw, profile, telemetry, pins, ollama, time } = data;

  if (process.stdout.isTTY && !process.env.CI) {
    process.stdout.write("\x1Bc");
  }

  const gwBadge = gw.online 
    ? `${GREEN}● ONLINE${RESET} ${DIM}(${gw.latencyMs}ms, HTTP ${gw.statusCode})${RESET}` 
    : `${RED}○ OFFLINE${RESET} ${DIM}(port 20128 not responding)${RESET}`;

  const profileBadge = `${CYAN}${BOLD}[${profile.toUpperCase()}]${RESET}`;
  const ollamaBadge = ollama.online
    ? `${GREEN}● ONLINE${RESET} ${DIM}(${ollama.modelCount} models)${RESET}`
    : `${YELLOW}○ STANDBY${RESET} ${DIM}(offline)${RESET}`;

  console.log(`┌──────────────────────────────────────────────────────────────────────────────┐`);
  console.log(`│ ${BOLD}LIMITLESS CLAUDE 8.2 — RUNTIME CONTROL & OBSERVABILITY TUI${RESET}       ${DIM}${time}${RESET} │`);
  console.log(`├──────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ Active Profile : ${profileBadge.padEnd(40)} Gateway : ${gwBadge.padEnd(35)} │`);
  console.log(`│ Local Ollama   : ${ollamaBadge.padEnd(76)} │`);
  console.log(`├──────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ ${BOLD}COMPOSITE ROUTING TIERS (4 FRONTIER TIERS)${RESET}                                    │`);
  console.log(`│  • ${MAGENTA}Limitless Opus 5.5${RESET}   : Full agentic loops, Next.js 19, R3F 3D, complex refactors │`);
  console.log(`│  • ${BLUE}Limitless Sonnet 5.5${RESET} : Architectural analysis, deep reasoning, code review   │`);
  console.log(`│  • ${CYAN}Limitless Haiku 5.5${RESET}  : Ultra-fast syntax checks, atomic diffs, lightweight tools │`);
  console.log(`│  • ${YELLOW}Limitless Fable 5.1${RESET}  : Mythos frontier synthesis, cross-repo architectural lead│`);
  console.log(`├──────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ ${BOLD}TOKEN TELEMETRY & COST AVOIDANCE${RESET}                                             │`);
  console.log(`│  Total Calls     : ${BOLD}${String(telemetry.totalCalls).padEnd(10)}${RESET} │ Total Tokens   : ${BOLD}${String((telemetry.totalTokens / 1_000_000).toFixed(2) + "M").padEnd(10)}${RESET}     │`);
  console.log(`│  Prompt Input    : ${String((telemetry.totalInputTokens / 1_000_000).toFixed(2) + "M").padEnd(10)} │ Completion Out : ${String((telemetry.totalOutputTokens / 1_000).toFixed(1) + "k").padEnd(10)}       │`);
  console.log(`│  Anthropic Value : ${GREEN}${BOLD}$${telemetry.costSavings?.sonnetEquivUsd?.toFixed(2) || "0.00"} USD${RESET}  │ Actual Billed  : ${GREEN}${BOLD}$0.00 USD${RESET} (Free Stack) │`);
  console.log(`├──────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ ${BOLD}ACTIVE TASK-TO-MODEL PINS${RESET}                                                      │`);
  
  const pinKeys = Object.keys(pins);
  if (pinKeys.length === 0) {
    console.log(`│  ${DIM}No active pins configured. Dynamic capability evaluator in control.${RESET}         │`);
  } else {
    for (const task of pinKeys.slice(0, 4)) {
      console.log(`│  • Task [${task.padEnd(12)}] → ${pins[task].padEnd(52)} │`);
    }
  }

  console.log(`├──────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ ${DIM}Hotkeys: [r] Refresh  [s] Full Stats  [p] Pins  [q] Quit${RESET}                         │`);
  console.log(`└──────────────────────────────────────────────────────────────────────────────┘`);
}

async function collectData() {
  let db = null;
  try {
    db = getDatabase();
  } catch (_) {}

  const gw = await pingGateway();
  const profile = defaultConfigManager.getActiveProfile();
  const telemetry = defaultTokenTracker.getTelemetry({ db });
  const pins = defaultTaskPinManager.listPins();
  const ollama = await defaultOllamaDiscovery.probe();

  return {
    gw,
    profile,
    telemetry,
    pins,
    ollama,
    time: new Date().toLocaleTimeString()
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isOnce = args.includes("--once") || !process.stdout.isTTY || Boolean(process.env.CI);
  const isJson = args.includes("--json");

  if (isJson) {
    const data = await collectData();
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }

  if (isOnce) {
    const data = await collectData();
    renderScreen(data);
    process.exit(0);
  }

  // Interactive Loop
  const data = await collectData();
  renderScreen(data);

  const refreshInterval = setInterval(async () => {
    const fresh = await collectData();
    renderScreen(fresh);
  }, 3000);

  // Keypress listener
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on("keypress", (str, key) => {
      if (key.ctrl && key.name === "c" || key.name === "q") {
        clearInterval(refreshInterval);
        process.stdin.setRawMode(false);
        console.log(`\n${GREEN}Exited Limitless TUI.${RESET}`);
        process.exit(0);
      } else if (key.name === "r") {
        collectData().then(renderScreen);
      }
    });
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`TUI error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { renderScreen, collectData, main };
