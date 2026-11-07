/**
 * Limitless Claude 7.0 - OpenCode Zen Provider Profile
 * 
 * Pay-as-you-go routed tier with strict budget metering and token accounting.
 */

const { BILLING_CLASSES } = require("../core/billing-classifier");

module.exports = {
  id: "opencode-zen",
  displayName: "OpenCode Zen Metered Gateway",
  description: "Metered pay-as-you-go gateway with strict per-turn budget protection",
  billingType: BILLING_CLASSES.PAY_AS_YOU_GO,
  targetBaseUrl: "https://zen.opencode.ai/v1",
  requiredEnv: ["OPENCODE_ZEN_API_KEY"],
  defaultTiers: {
    haiku: "opencode-zen/deepseek-chat",
    sonnet: "opencode-zen/claude-3-5-sonnet",
    opus: "opencode-zen/claude-3-5-sonnet",
    fable: "opencode-zen/claude-3-opus"
  },
  setupInstructions: [
    "Obtain an API key from zen.opencode.ai",
    "Configure provider 'opencode-zen' in OmniRoute dashboard (http://localhost:20128/providers)",
    "Set spending threshold in OmniRoute to prevent unexpected overdraft"
  ],
  verify(env = process.env) {
    if (!env.OPENCODE_ZEN_API_KEY) {
      return {
        ready: false,
        error: "Missing OPENCODE_ZEN_API_KEY environment variable"
      };
    }
    return {
      ready: true,
      baseUrl: "https://zen.opencode.ai/v1"
    };
  }
};
