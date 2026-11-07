/**
 * Limitless Claude 7.0 - Limitless Multi-Provider Router Profile
 * 
 * Intelligent local router profile utilizing multi-provider combos on OmniRoute daemon (port 20128).
 * Provides Claude Code, Cursor, Superdesign, and Antigravity with zero-marginal-cost
 * and subscription-entitled inference pools with automated circuit breakers and fallbacks.
 */

const http = require("http");
const { BILLING_CLASSES } = require("../core/billing-classifier");

module.exports = {
  id: "limitless",
  displayName: "Limitless Multi-Provider Router",
  description: "Dynamic intelligent routing through local OmniRoute gateway combos with automatic failover",
  billingType: BILLING_CLASSES.ZERO_MARGINAL_COST,
  targetBaseUrl: "http://127.0.0.1:20128",
  requiredEnv: [],
  defaultTiers: {
    haiku: "limitless-haiku-5.5",
    sonnet: "limitless-sonnet-5.5",
    opus: "limitless-opus-5.5",
    fable: "limitless-fable-5.1"
  },
  setupInstructions: [
    "Run OmniRoute background daemon: omniroute start",
    "Configure API keys in OmniRoute dashboard (http://localhost:20128/keys)",
    "Run node scripts/setup.js to populate intelligent tier combos and routing models"
  ],
  async verify(baseUrl = "http://127.0.0.1:20128") {
    return new Promise((resolve) => {
      const u = new URL(baseUrl);
      const req = http.request({
        hostname: u.hostname,
        port: u.port || 20128,
        path: "/api/health",
        method: "GET",
        timeout: 3000
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ ready: true, baseUrl, statusCode: res.statusCode });
        } else {
          resolve({ ready: false, baseUrl, error: `OmniRoute returned HTTP ${res.statusCode}` });
        }
      });

      req.on("error", (err) => {
        resolve({
          ready: false,
          baseUrl,
          error: `Could not connect to OmniRoute daemon at ${baseUrl}: ${err.message}`
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          ready: false,
          baseUrl,
          error: `Timeout connecting to OmniRoute daemon at ${baseUrl}`
        });
      });

      req.end();
    });
  }
};
