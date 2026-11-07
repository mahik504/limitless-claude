#!/usr/bin/env node
/**
 * Limitless Claude - Benchmark Runner CLI
 * 
 * Runs the 12-task capability benchmark against OmniRoute gateway.
 * 
 * Usage:
 *   node scripts/benchmark.js [--target <combo>] [--json]
 */

const { BenchmarkEngine, BENCHMARK_TASKS } = require("../src/core/benchmark-engine");
const { getDatabase } = require("../src/omniroute/db");
const { findTargetApiKey } = require("../src/omniroute/permissions");
const { logger } = require("../src/utils/logger");

function printHelp() {
  console.log(`
Limitless Claude - Benchmark Runner CLI

Usage:
  node scripts/benchmark.js [options]

Options:
  --target <combo>     Target combo or model (default: limitless-sonnet-5.5)
  --task <id>          Run a specific single task by id
  --json               Output benchmark results in JSON format
  --help               Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  let target = "limitless-sonnet-5.5";
  let singleTaskId = null;
  let isJson = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else if (a === "--target" && args[i + 1]) {
      target = args[++i];
    } else if (a === "--task" && args[i + 1]) {
      singleTaskId = args[++i];
    } else if (a === "--json") {
      isJson = true;
    }
  }

  // Obtain OmniRoute API key from local database or environment
  let apiKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || null;
  if (!apiKey) {
    try {
      const db = getDatabase();
      const row = findTargetApiKey(db);
      if (row && row.key) apiKey = row.key;
    } catch (_) {}
  }

  if (!apiKey) {
    console.error("\x1b[31m[ERROR] No authorized OmniRoute API key found for benchmarking.\x1b[0m");
    console.error("Please configure an API key via ~/.claude/settings.json or run `limitless setup`.");
    process.exit(1);
  }

  const engine = new BenchmarkEngine();

  if (!isJson) {
    console.log("\n================================================================================");
    console.log("             LIMITLESS CLAUDE — 12-TASK CAPABILITY BENCHMARK");
    console.log("================================================================================");
    console.log(` Target Endpoint : ${target}`);
    console.log(` Gateway         : 127.0.0.1:20128\n`);
  }

  const tasksToRun = singleTaskId 
    ? BENCHMARK_TASKS.filter(t => t.id === singleTaskId)
    : BENCHMARK_TASKS;

  if (tasksToRun.length === 0) {
    console.error(`Task "${singleTaskId}" not found.`);
    process.exit(1);
  }

  const results = [];
  for (const t of tasksToRun) {
    if (!isJson) {
      process.stdout.write(` Running [${(t.profile || t.tier || "TASK").padEnd(7)}] ${t.name.padEnd(36)} ... `);
    }
    const r = await engine.runTask(t, target, apiKey);
    results.push(r);

    if (!isJson) {
      if (r.passed) {
        console.log(`\x1b[32mPASS\x1b[0m (${r.latencyMs}ms, score: ${r.score}%)`);
      } else {
        console.log(`\x1b[31mFAIL\x1b[0m (HTTP ${r.statusCode || 0}, ${r.error || "assertion failed"})`);
      }
    }
  }

  const totalPassed = results.filter(r => r.passed).length;
  const avgLatency = Math.round(results.reduce((acc, r) => acc + (r.latencyMs || 0), 0) / results.length);
  const totalTokens = results.reduce((acc, r) => acc + (r.tokensUsed || 0), 0);
  const scorePercent = Math.round((totalPassed / results.length) * 100);

  if (isJson) {
    console.log(JSON.stringify({
      target,
      totalPassed,
      totalTasks: results.length,
      scorePercent,
      avgLatencyMs: avgLatency,
      totalTokens,
      results
    }, null, 2));
  } else {
    console.log("\n--------------------------------------------------------------------------------");
    console.log(` Benchmark Summary: ${totalPassed}/${results.length} Passed (${scorePercent}%) | Avg Latency: ${avgLatency}ms | Total Tokens: ${totalTokens}`);
    console.log("================================================================================\n");
  }
}

if (require.main === module) {
  main().catch(err => {
    logger.error(`Benchmark runner failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
