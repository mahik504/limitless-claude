#!/usr/bin/env node
/**
 * Limitless Claude 8.0 - Budget, Spend Tracking & Capacity Calculator CLI
 * 
 * Inspect spend controls and token throughput models:
 *   limitless budget
 *   limitless budget --calculate <reqPerDay>
 */

const { defaultClassifier } = require("../src/core/billing-classifier");
const { defaultCapacityCalculator } = require("../src/core/capacity-calculator");

const args = process.argv.slice(2);
const calcArgIdx = args.indexOf("--calculate");
const customReqPerDay = calcArgIdx !== -1 && args[calcArgIdx + 1] ? parseInt(args[calcArgIdx + 1], 10) : null;

const report = defaultCapacityCalculator.getCapacityReport();

console.log(`
================================================================================
       LIMITLESS CLAUDE 8.5.0 — BUDGET & TOKEN CAPACITY INTELLIGENCE
================================================================================

  SPENDING CONTROLS:
  - Max Daily Budget Cap : $${defaultClassifier.maxDailyBudget.toFixed(2)} USD
  - Current Daily Spend  : $${defaultClassifier.currentDailySpend.toFixed(2)} USD
  - Free-Only Mode Policy: Excludes all paid-token & unknown cost candidates

  OPENROUTER FREE QUOTA VERIFIED POLICY:
  - Unfunded Free Account: Capped at 50 requests/day on :free models.
  - Funded Free Account  : Depositing $10.00 USD unlocks 1,000 requests/day
                           on :free models without deducting from the $10 credit.
  - Policy Verification  : Official OpenRouter docs (verified ${report.policyDate}).

--------------------------------------------------------------------------------
DAILY TOKEN THROUGHPUT MODELING (Theoretical Bounds)
--------------------------------------------------------------------------------
  WORKLOAD PROFILE               TOKENS/REQ   50 REQ/DAY (Unfunded)   1000 REQ/DAY ($10 Funded)
  -----------------------------  ----------   ---------------------   -------------------------
`);

for (let i = 0; i < report.unfundedTier.scenarios.length; i++) {
  const u = report.unfundedTier.scenarios[i];
  const f = report.fundedTier.scenarios[i];
  const name = u.scenario.padEnd(30).slice(0, 30);
  const perReq = `${(u.inPerReq + u.outPerReq) / 1000}k tok`.padEnd(12);
  const unfunded = u.formattedTotal.padEnd(23);
  const funded = f.formattedTotal;
  console.log(`  ${name} ${perReq} ${unfunded} ${funded}`);
}

if (customReqPerDay) {
  console.log(`\n  Custom Scenario (${customReqPerDay} req/day):`);
  const customScenarios = defaultCapacityCalculator.calculateDailyCapacity(customReqPerDay);
  for (const c of customScenarios) {
    console.log(`  - ${c.scenario}: ${c.formattedTotal}`);
  }
}

console.log(`
--------------------------------------------------------------------------------
NOTE: ${report.disclaimer}
================================================================================
`);
