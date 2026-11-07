/**
 * Limitless Claude 7.0 - OpenCode Go Provider Profile
 * 
 * Subscription-entitled provider integration for OpenCode Go subscribers.
 * Enables zero-per-token coding models into Limitless Claude combos via OpenAI-compatible endpoints.
 */

const { BILLING_CLASSES } = require("../core/billing-classifier");

module.exports = {
  id: "opencode-go",
  displayName: "OpenCode Go Subscription",
  description: "Subscription-covered coding pool mapped directly into OmniRoute and Claude Code",
  billingType: BILLING_CLASSES.SUBSCRIPTION_ENTITLED,
  targetBaseUrl: "https://api.opencode.ai/v1",
  requiredEnv: ["OPENCODE_GO_API_KEY"],
  defaultTiers: {
    haiku: "opencode-go/claude-3-5-haiku",
    sonnet: "opencode-go/claude-3-5-sonnet",
    opus: "opencode-go/claude-3-5-sonnet",
    fable: "opencode-go/gpt-4o"
  },
  setupInstructions: [
    "Subscribe to OpenCode Go and generate an API key from dashboard.opencode.ai",
    "Add 'opencode-go' provider in OmniRoute dashboard (http://localhost:20128/providers)",
    "Set Base URL to https://api.opencode.ai/v1 and enter your OPENCODE_GO_API_KEY",
    "Run node scripts/setup.js to automatically include OpenCode Go models in active combos"
  ],
  verify(env = process.env) {
    const key = env.OPENCODE_GO_API_KEY || env.OPENCODE_API_KEY;
    if (!key) {
      return {
        ready: false,
        error: "Missing OPENCODE_GO_API_KEY environment variable"
      };
    }
    return {
      ready: true,
      baseUrl: "https://api.opencode.ai/v1"
    };
  }
};
