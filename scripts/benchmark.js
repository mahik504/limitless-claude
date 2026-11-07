#!/usr/bin/env node
/**
 * Limitless Claude 7.0 - Benchmark Runner CLI
 * 
 * Runs the 12-task capability benchmark against OmniRoute gateway.
 * 
 * Usage:
 *   node scripts/benchmark.js [--target <combo>] [--json]
 */

const { BenchmarkEngine, BENCHMARK_TASKS } = require("../src/core/benchmark-engine");
const { getDatabase } = require("../src/omniroute/db");
const { getOmniRouteApiKey } = require("../src/omniroute/permissions");
const { logger } = require("../src/utils/logger");

function printHelp() {
  console.log(`
Limitless Claude 7.0 - Benchmark Runner CLI

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
  let target = "auto";
  let singleTaskId = null;
  let isJson = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else if (a === "--target") {
      target = args[++i];
    } else if (a === "--task") {
      singleTaskId = args[++i];
    } else if (a === "--json") {
      isJson = true;
    }
  }

  // Obtain OmniRoute API key from local database or default fallback
  let apiKey = null;
  try {
    const db = getDatabase();
    const row = db.prepare("SELECT key FROM api_keys WHERE is_active = 1 LIMIT 1").get();
    if (row && row.key) apiKey = row.key;
  } catch (_) {}
  if (!apiKey) {
    apiKey = "sk-ant-api03-85702967f40fcc12-f121cd-a362127e";
  }

  const engine = new BenchmarkEngine();

  if (!isJson) {
    console.log("\n================================================================================");
    console.log("             LIMITLESS CLAUDE 7.0 - 12-TASK CAPABILITY BENCHMARK");
    console.log("================================================================================");
    console.log(` Target Endpoint : ${target}`);
    console.log(` Gateway         : 127.0.0.1:20128\n`);
  }

  if (singleTaskId) {
    const task = BENCHMARK_TASKS.find(t => t.id === singleTaskId);
    if (!task) {
      logger.error(`Unknown task ID: ${singleTaskId}`);
      process.exit(1);
    }
    const res = await engine.runTask(task, target, apiKey);
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`Task        : ${res.taskName} (${res.taskId})`);
      console.log(`Profile     : ${res.profile}`);
      console.log(`Status      : ${res.passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"} (Score: ${res.score}%)`);
      console.log(`Latency     : ${res.latencyMs} ms`);
      console.log(`Snippet     : ${res.outputSnippet}`);
    }
    return;
  }

  const results = await engine.runSuite(target, apiKey);

  if (isJson) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log("  TASK ID                  PROFILE    LATENCY    SCORE   STATUS");
  console.log("  -----------------------  ---------  ---------  ------  --------");
  for (const t of results.tasks) {
    const statusStr = t.passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    console.log(`  ${t.taskId.padEnd(23)}  ${t.profile.padEnd(9)}  ${(t.latencyMs + " ms").padEnd(9)}  ${(t.score + "%").padEnd(6)}  ${statusStr}`);
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(` Overall Score : ${results.overallScore}% (${results.passedCount}/${results.totalCount} passed)`);
  console.log("================================================================================\n");
}

if (require.main === module) {
  main().catch(err => {
    logger.error(`Benchmark failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
