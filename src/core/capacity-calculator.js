/**
 * Limitless Claude 8.0 - Token & Request Capacity Intelligence Calculator
 * 
 * Provides concrete capacity modeling based on verified provider policies:
 * - OpenRouter free model quota (50 req/day unfunded vs 1,000 req/day with $10 credit)
 * - Daily token throughput calculations across standard workload profiles
 * - Upstream concurrency and rate-limit guardrails
 */

const SCENARIOS = [
  { name: "Micro-Patch / Syntax", inTokens: 1_000, outTokens: 1_000 },
  { name: "Standard Feature / Unit Test", inTokens: 4_000, outTokens: 1_000 },
  { name: "Full-File Architecture / RLS", inTokens: 10_000, outTokens: 2_000 }
];

class CapacityCalculator {
  constructor() {
    this.openRouterUnfundedLimit = 50; // req/day
    this.openRouterFundedLimit = 1_000; // req/day with $10 credit
  }

  calculateDailyCapacity(reqPerDay) {
    return SCENARIOS.map(s => {
      const dailyInputTokens = s.inTokens * reqPerDay;
      const dailyOutputTokens = s.outTokens * reqPerDay;
      const totalDailyTokens = dailyInputTokens + dailyOutputTokens;

      return {
        scenario: s.name,
        reqPerDay,
        inPerReq: s.inTokens,
        outPerReq: s.outTokens,
        dailyInputTokens,
        dailyOutputTokens,
        totalDailyTokens,
        formattedTotal: `${(totalDailyTokens / 1_000_000).toFixed(2)}M tokens/day`
      };
    });
  }

  getCapacityReport() {
    return {
      policyDate: "November 2026",
      disclaimer: "These calculations represent theoretical daily throughput bounds. Actual delivery depends on upstream rate limits, model availability, and provider concurrency caps.",
      unfundedTier: {
        dailyRequests: this.openRouterUnfundedLimit,
        scenarios: this.calculateDailyCapacity(this.openRouterUnfundedLimit)
      },
      fundedTier: {
        dailyRequests: this.openRouterFundedLimit,
        creditRequirement: "$10.00 USD one-time deposit",
        scenarios: this.calculateDailyCapacity(this.openRouterFundedLimit)
      }
    };
  }
}

const defaultCapacityCalculator = new CapacityCalculator();

module.exports = {
  SCENARIOS,
  CapacityCalculator,
  defaultCapacityCalculator
};
