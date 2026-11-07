#!/usr/bin/env node
/**
 * Limitless Claude 8.2 - Live Token & Savings Telemetry CLI
 * 
 * Usage:
 *   node scripts/stats.js [--json]
 */

const { defaultTokenTracker } = require("../src/core/token-tracker");

function formatNumber(num) {
  return (num || 0).toLocaleString();
}

function printStats(isJson = false) {
  const data = defaultTokenTracker.getTelemetry();

  if (isJson) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log("================================================================================");
  console.log("             LIMITLESS CLAUDE 8.2 — REAL-TIME TOKEN & SAVINGS TELEMETRY");
  console.log("================================================================================");

  if (!data.available) {
    console.log("  [NOTICE] No active OmniRoute database detected or zero telemetry records found.");
    console.log("  Run `limitless setup` and execute requests to begin tracking live tokens.");
    console.log("================================================================================");
    return;
  }

  console.log(`  Total Requests Processed   : ${formatNumber(data.totalCalls)}`);
  console.log(`  Total Tokens Transferred   : ${formatNumber(data.totalTokens)} (${(data.totalTokens / 1_000_000).toFixed(2)}M tokens)`);
  console.log(`    - Prompt Input Tokens    : ${formatNumber(data.totalInputTokens)}`);
  console.log(`    - Completion Tokens      : ${formatNumber(data.totalOutputTokens)}`);
  if (data.totalReasoningTokens > 0) {
    console.log(`    - Reasoning Tokens       : ${formatNumber(data.totalReasoningTokens)}`);
  }
  console.log("--------------------------------------------------------------------------------");
  console.log("  ESTIMATED DIRECT ANTHROPIC VALUE & COST SAVINGS:");
  console.log(`  • Sonnet 3.5 / 3.7 Equivalent Value : $${data.costSavings.sonnetEquivUsd.toFixed(2)} USD`);
  console.log(`  • Opus 3.0 / 3.5 Equivalent Value   : $${data.costSavings.opusEquivUsd.toFixed(2)} USD`);
  console.log(`  • Blended Savings (70% Sonnet, 20% Opus) : $${data.costSavings.blendedEquivUsd.toFixed(2)} USD`);
  console.log(`  • Actual Billed Cost to You              : $0.00 USD (100% Free / Sponsored Stack)`);
  console.log("--------------------------------------------------------------------------------");
  
  console.log("  TOKEN VOLUME BY COMBO TIER:");
  for (const [name, stats] of Object.entries(data.combos)) {
    const pct = ((stats.totalTokens / data.totalTokens) * 100).toFixed(1);
    console.log(`  • ${name.padEnd(28)} : ${formatNumber(stats.totalTokens).padStart(10)} tokens (${pct}%) across ${stats.calls} calls`);
  }
  console.log("--------------------------------------------------------------------------------");

  console.log("  TOP UPSTREAM PROVIDERS ROUTED:");
  const topProviders = Object.entries(data.providers)
    .filter(([_, stats]) => stats.totalTokens > 0)
    .slice(0, 8);
  for (const [provider, stats] of topProviders) {
    const pct = ((stats.totalTokens / data.totalTokens) * 100).toFixed(1);
    console.log(`  • ${provider.padEnd(20)} : ${formatNumber(stats.totalTokens).padStart(10)} tokens (${pct}%)`);
  }
  console.log("================================================================================");
}

if (require.main === module) {
  const isJson = process.argv.includes("--json");
  printStats(isJson);
}

module.exports = { printStats };
