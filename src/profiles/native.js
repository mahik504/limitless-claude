/**
 * Limitless Claude 7.0 - Native Anthropic Provider Profile
 * 
 * Direct official Anthropic connection.
 * Used when an official Anthropic API key or Claude Pro/Team/Max subscription is available.
 */

const { BILLING_CLASSES } = require("../core/billing-classifier");

module.exports = {
  id: "native",
  displayName: "Official Anthropic API",
  description: "Direct connection to Anthropic API endpoints without local proxy routing",
  billingType: BILLING_CLASSES.PAID_TOKEN,
  targetBaseUrl: "https://api.anthropic.com",
  requiredEnv: ["ANTHROPIC_API_KEY"],
  defaultTiers: {
    haiku: "claude-3-5-haiku-20241022",
    sonnet: "claude-3-5-sonnet-20241022",
    opus: "claude-3-opus-20240229",
    fable: "claude-3-5-sonnet-20241022"
  },
  setupInstructions: [
    "Obtain an API key from console.anthropic.com",
    "Set ANTHROPIC_API_KEY in your environment or ~/.claude/settings.json",
    "Unset ANTHROPIC_BASE_URL to communicate directly with Anthropic"
  ],
  verify(env = process.env) {
    if (!env.ANTHROPIC_API_KEY) {
      return {
        ready: false,
        error: "Missing ANTHROPIC_API_KEY environment variable"
      };
    }
    return {
      ready: true,
      baseUrl: "https://api.anthropic.com"
    };
  }
};
