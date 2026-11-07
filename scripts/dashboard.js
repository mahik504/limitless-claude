#!/usr/bin/env node
/**
 * Limitless Claude 7.0 - Terminal Observability Dashboard
 * 
 * Displays real-time gateway health, latency percentiles, provider status,
 * combo configurations, and estimated cost with full secret redaction.
 * 
 * Usage:
 *   node scripts/dashboard.js [--watch] [--json]
 */

const http = require("http");
const { getDatabase } = require("../src/omniroute/db");
const { defaultTelemetryEngine } = require("../src/core/telemetry");
const { defaultConfigManager } = require("../src/core/config-manager");
const { redactSecret } = require("../src/utils/redact");

function printHelp() {
  console.log(`
Limitless Claude 7.0 - Observability Dashboard

Usage:
  node scripts/dashboard.js [options]

Options:
  --watch       Continuously refresh the dashboard every 3 seconds
  --json        Output metrics in JSON format for automated ingestion
  --help        Show this help message
`);
}

async function checkGatewayHealth(port = 20128) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: "/api/health",
      method: "GET",
      timeout: 1500
    }, (res) => {
      resolve({ online: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode });
    });

    req.on("error", () => resolve({ online: false, statusCode: 0 }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ online: false, statusCode: 0 });
    });
    req.end();
  });
}

async function renderDashboard(isJson = false) {
  let db = null;
  try {
    db = getDatabase();
  } catch (_) {}

  const telemetry = defaultTelemetryEngine.getMetrics(db);
  const activeProfile = defaultConfigManager.getActiveProfile();
  const conflicts = defaultConfigManager.detectConflicts();
  const gwHealth = await checkGatewayHealth(20128);

  if (isJson) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      activeProfile,
      gateway: gwHealth,
      telemetry,
      conflicts
    }, null, 2));
    return;
  }

  // Clear screen in watch mode
  if (process.stdout.isTTY) {
    process.stdout.write("\x1Bc");
  }

  console.log("================================================================================");
  console.log("                     LIMITLESS CLAUDE 7.0 OBSERVABILITY DASHBOARD");
  console.log("================================================================================");
  console.log(` Active Profile  : [${activeProfile.toUpperCase()}]`);
  const gwStatusStr = gwHealth.online 
    ? `\x1b[32mONLINE\x1b[0m (HTTP ${gwHealth.statusCode})` 
    : "\x1b[31mOFFLINE\x1b[0m (Port 20128 not responding)";
  console.log(` Gateway Status  : ${gwStatusStr}`);
  console.log(` Time            : ${new Date().toLocaleTimeString()} | Database: ${db ? "Connected" : "Not connected"}`);
  console.log("--------------------------------------------------------------------------------");

  // Metrics Section
  console.log(" [CALL METRICS & QUOTA]");
  console.log(` Total Calls     : ${telemetry.totalCalls.toString().padEnd(10)} | Success Rate   : ${telemetry.successRate}%`);
  console.log(` p50 Latency     : ${telemetry.p50LatencyMs.toString().padEnd(8)} ms | p95 Latency    : ${telemetry.p95LatencyMs} ms`);
  console.log(` Input Tokens    : ${telemetry.totalInputTokens.toLocaleString().padEnd(10)} | Output Tokens  : ${telemetry.totalOutputTokens.toLocaleString()}`);
  console.log(` Estimated Cost  : $${telemetry.estimatedCostUsd.toFixed(4)} USD`);
  console.log("--------------------------------------------------------------------------------");

  // Combos Section
  console.log(" [ROUTING COMBOS]");
  if (telemetry.comboStats && telemetry.comboStats.length > 0) {
    for (const c of telemetry.comboStats) {
      console.log(` - ${c.name.padEnd(26)} : ${c.modelCount} models configured`);
    }
  } else {
    console.log("  No combos configured in storage.sqlite. Run `node scripts/setup.js`.");
  }
  console.log("--------------------------------------------------------------------------------");

  // Provider Connections Section
  console.log(" [UPSTREAM PROVIDERS]");
  if (telemetry.providerStats && telemetry.providerStats.length > 0) {
    console.log("  PROVIDER        STATUS       PRIORITY   RATE LIMIT / ERROR");
    console.log("  --------------  -----------  ---------  --------------------------------------");
    for (const p of telemetry.providerStats) {
      const statusStr = p.isActive ? "\x1b[32mACTIVE\x1b[0m     " : "\x1b[31mDISABLED\x1b[0m   ";
      const errOrLimit = p.rateLimitedUntil 
        ? `Rate-limited until ${p.rateLimitedUntil}` 
        : (p.lastError ? redactSecret(p.lastError.slice(0, 38)) : "OK");
      console.log(`  ${p.provider.padEnd(14)}  ${statusStr}  ${p.priority.toString().padEnd(9)}  ${errOrLimit}`);
    }
  } else {
    console.log("  No providers found in storage.sqlite.");
  }
  console.log("--------------------------------------------------------------------------------");

  // Conflict Warnings
  if (conflicts.length > 0) {
    console.log(" \x1b[33m[CONFIGURATION CONFLICTS DETECTED]\x1b[0m");
    for (const c of conflicts) {
      console.log(`  ! [${c.type}] ${c.message} (${c.value || c.file || ""})`);
    }
    console.log("--------------------------------------------------------------------------------");
  }

  console.log(" Press Ctrl+C to exit dashboard.");
}

async function main() {
  const args = process.argv.slice(2);
  const isHelp = args.includes("--help") || args.includes("-h");
  const isWatch = args.includes("--watch");
  const isJson = args.includes("--json");

  if (isHelp) {
    printHelp();
    process.exit(0);
  }

  await renderDashboard(isJson);

  if (isWatch) {
    setInterval(async () => {
      await renderDashboard(isJson);
    }, 3000);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Dashboard error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { renderDashboard, main };
