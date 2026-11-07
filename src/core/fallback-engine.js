/**
 * Limitless Claude 7.0 - Active Fallback & Health Smoke-Testing Engine
 * 
 * Verifies live upstream model responsiveness and semantic validity.
 * Detects HTTP 200 deprecation traps (e.g. Antigravity "no longer supported" messages),
 * updates model registry health state, and trips circuit breakers safely.
 */

const http = require("http");
const { HEALTH_STATUS, defaultModelRegistry } = require("./model-registry");
const { FAILURE_TYPE, defaultRoutingPolicy } = require("./routing-policy");
const { logger } = require("../utils/logger");

const DEPRECATION_PATTERNS = [
  /this version of antigravity is no longer supported/i,
  /unsupported client version/i,
  /client version is no longer supported/i,
  /please upgrade your client/i,
  /api version has been deprecated/i
];

class FallbackEngine {
  constructor(options = {}) {
    this.modelRegistry = options.modelRegistry || defaultModelRegistry;
    this.routingPolicy = options.routingPolicy || defaultRoutingPolicy;
    this.gatewayHost = options.gatewayHost || "127.0.0.1";
    this.gatewayPort = options.gatewayPort || 20128;
    this.timeoutMs = options.timeoutMs || 8000;
  }

  isDeprecationResponse(text) {
    if (!text || typeof text !== "string") return false;
    return DEPRECATION_PATTERNS.some(pattern => pattern.test(text));
  }

  async runSmokeTest(provider, model, apiKey = null) {
    const key = `${provider}/${model}`;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const payload = JSON.stringify({
        model: `${provider}/${model}`,
        messages: [{ role: "user", content: "Reply PONG" }],
        max_tokens: 16,
        temperature: 0.0
      });

      const headers = {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      };

      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const req = http.request({
        hostname: this.gatewayHost,
        port: this.gatewayPort,
        path: "/v1/chat/completions",
        method: "POST",
        headers,
        timeout: this.timeoutMs
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          const latencyMs = Date.now() - startTime;
          const breaker = this.routingPolicy.getCircuitBreaker(provider, model);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Check if response text contains upstream deprecation string
            if (this.isDeprecationResponse(body)) {
              logger.warn(`Model ${key} returned deprecation notice: ${body.slice(0, 120)}...`);
              this.modelRegistry.updateHealth(provider, model, HEALTH_STATUS.DEGRADED, "Deprecation notice in response", latencyMs);
              breaker.recordFailure(FAILURE_TYPE.DEPRECATION);
              return resolve({
                success: false,
                health: HEALTH_STATUS.DEGRADED,
                isDeprecation: true,
                latencyMs,
                error: "Upstream model deprecated"
              });
            }

            // Valid healthy response
            this.modelRegistry.updateHealth(provider, model, HEALTH_STATUS.HEALTHY, null, latencyMs);
            breaker.recordSuccess();
            return resolve({
              success: true,
              health: HEALTH_STATUS.HEALTHY,
              isDeprecation: false,
              latencyMs,
              body
            });
          }

          // Non-2xx response
          const failureType = this.routingPolicy.classifyFailure(null, body, res.statusCode);
          const isFatal = failureType === FAILURE_TYPE.AUTH_FATAL;
          const status = isFatal ? HEALTH_STATUS.UNAVAILABLE : HEALTH_STATUS.DEGRADED;

          this.modelRegistry.updateHealth(provider, model, status, `HTTP ${res.statusCode}: ${body.slice(0, 100)}`, latencyMs);
          breaker.recordFailure(failureType);

          return resolve({
            success: false,
            health: status,
            statusCode: res.statusCode,
            failureType,
            latencyMs,
            error: body
          });
        });
      });

      req.on("error", (err) => {
        const latencyMs = Date.now() - startTime;
        const failureType = this.routingPolicy.classifyFailure(err, null, null);
        const breaker = this.routingPolicy.getCircuitBreaker(provider, model);

        this.modelRegistry.updateHealth(provider, model, HEALTH_STATUS.DEGRADED, err.message, latencyMs);
        breaker.recordFailure(failureType);

        return resolve({
          success: false,
          health: HEALTH_STATUS.DEGRADED,
          failureType,
          latencyMs,
          error: err.message
        });
      });

      req.on("timeout", () => {
        req.destroy();
        const latencyMs = Date.now() - startTime;
        const breaker = this.routingPolicy.getCircuitBreaker(provider, model);

        this.modelRegistry.updateHealth(provider, model, HEALTH_STATUS.DEGRADED, "Request timed out", latencyMs);
        breaker.recordFailure(FAILURE_TYPE.TRANSIENT);

        return resolve({
          success: false,
          health: HEALTH_STATUS.DEGRADED,
          failureType: FAILURE_TYPE.TRANSIENT,
          latencyMs,
          error: "Timeout"
        });
      });

      req.write(payload);
      req.end();
    });
  }

  async probeCombo(candidates = [], apiKey = null) {
    const results = [];
    for (const c of candidates) {
      const p = c.provider || (c.model ? c.model.split("/")[0] : "");
      const m = c.model || c.id || "";
      if (!p || !m) continue;

      const res = await this.runSmokeTest(p, m, apiKey);
      results.push({ provider: p, model: m, ...res });
    }
    return results;
  }
}

const defaultFallbackEngine = new FallbackEngine();

module.exports = {
  FallbackEngine,
  defaultFallbackEngine,
  DEPRECATION_PATTERNS
};
