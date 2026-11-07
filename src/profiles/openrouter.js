/**
 * Limitless Claude 7.0 - OpenRouter Provider Profile
 * 
 * Supports both zero-marginal-cost :free models and high-throughput $10-credit tier
 * unlocking 1,000 req/day and wholesale frontier models.
 */

const { BILLING_CLASSES } = require("../core/billing-classifier");

module.exports = {
  id: "openrouter",
  displayName: "OpenRouter Gateway",
  description: "Aggregated inference hub supporting 50/day free models or 1,000/day tier with $10 balance",
  billingType: BILLING_CLASSES.PAID_TOKEN,
  targetBaseUrl: "https://openrouter.ai/api/v1",
  requiredEnv: ["OPENROUTER_API_KEY"],
  defaultTiers: {
    haiku: "openrouter/nvidia/nemotron-3.5-lightning:free",
    sonnet: "openrouter/deepseek/deepseek-chat",
    opus: "openrouter/qwen/qwen-2.5-coder-32b-instruct",
    fable: "openrouter/anthropic/claude-3.5-sonnet"
  },
  setupInstructions: [
    "Obtain an API key from openrouter.ai/keys",
    "Configure provider 'openrouter' in OmniRoute dashboard (http://localhost:20128/providers)",
    "For free tier: use models ending in :free (50 req/day)",
    "For expanded tier: deposit $10 credit to raise rate limit to 1,000 req/day and unlock wholesale models"
  ],
  verify(env = process.env) {
    if (!env.OPENROUTER_API_KEY) {
      return {
        ready: false,
        error: "Missing OPENROUTER_API_KEY environment variable"
      };
    }
    return {
      ready: true,
      baseUrl: "https://openrouter.ai/api/v1"
    };
  }
};
