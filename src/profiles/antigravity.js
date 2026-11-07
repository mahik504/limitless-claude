/**
 * Limitless Claude 7.0 - Antigravity OAuth Profile
 * 
 * Manages Google One AI / Antigravity OAuth connections with client deprecation safeguards.
 */

const { BILLING_CLASSES } = require("../core/billing-classifier");

module.exports = {
  id: "antigravity",
  displayName: "Antigravity OAuth Entitlement",
  description: "OAuth-based Google One AI models with active deprecation checks and graceful fallback",
  billingType: BILLING_CLASSES.SUBSCRIPTION_ENTITLED,
  targetBaseUrl: "http://127.0.0.1:20128",
  requiredEnv: [],
  defaultTiers: {
    haiku: "antigravity/gemini-2.5-flash",
    sonnet: "antigravity/gemini-2.5-pro",
    opus: "antigravity/claude-sonnet-4-5-thinking",
    fable: "antigravity/claude-opus-4-6-thinking"
  },
  setupInstructions: [
    "Ensure Antigravity CLI or IDE is installed and authenticated via agy auth login",
    "Configure provider 'antigravity' in OmniRoute dashboard (http://localhost:20128/providers)",
    "Run smoke testing to ensure Google Cloud Code PA endpoints are healthy and not deprecated"
  ],
  verify() {
    return {
      ready: true,
      baseUrl: "http://127.0.0.1:20128",
      note: "Requires live smoke test to ensure upstream PA version is supported"
    };
  }
};
