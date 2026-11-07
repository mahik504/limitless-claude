/**
 * Limitless Claude 7.0 - Dynamic Routing Policy & Circuit Breakers
 * 
 * Provides:
 * - Priority waterfall ordering (zero-marginal-cost/subscription first, paid last)
 * - Quality-aware model selection matching task profiles
 * - Circuit breakers with trip, half-open probe, and reset states
 * - Exponential cooldown backoff for rate limits (429)
 * - Granular failure classification (transient, deprecation, auth, fatal)
 * - Retry budgets per turn/request
 */

const { BILLING_CLASSES, defaultBillingClassifier } = require("./billing-classifier");
const { CAPABILITY_PROFILES, defaultCapabilityEvaluator } = require("./capability-evaluator");
const { HEALTH_STATUS } = require("./model-registry");

const CIRCUIT_STATE = {
  CLOSED: "CLOSED",       // Normal operation, all traffic allowed
  OPEN: "OPEN",           // Tripped, traffic blocked until cooldown expires
  HALF_OPEN: "HALF_OPEN"  // Testing single trial request
};

const FAILURE_TYPE = {
  TRANSIENT: "transient",               // 429, 502, 503, 504, timeout, socket hangup
  DEPRECATION: "deprecation",           // "no longer supported", outdated client version
  INCAPABLE: "incapable",               // tool call unsupported, max tokens exceeded
  AUTH_FATAL: "auth_fatal",             // 401, 403, invalid key, account suspended
  PROVIDER_DOWN: "provider_down"        // DNS resolution failed, connection refused
};

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.cooldownMs = options.cooldownMs ?? 30000; // 30s base cooldown
    this.maxCooldownMs = options.maxCooldownMs ?? 300000; // 5 min max
    this.state = CIRCUIT_STATE.CLOSED;
    this.consecutiveFailures = 0;
    this.lastFailureTime = null;
    this.nextAllowedTime = 0;
    this.cooldownMultiplier = 1;
  }

  isAvailable() {
    const now = Date.now();
    if (this.state === CIRCUIT_STATE.CLOSED) {
      return true;
    }
    if (this.state === CIRCUIT_STATE.OPEN) {
      if (now >= this.nextAllowedTime) {
        this.state = CIRCUIT_STATE.HALF_OPEN;
        return true;
      }
      return false;
    }
    if (this.state === CIRCUIT_STATE.HALF_OPEN) {
      // In half-open, only allow one probe at a time
      return true;
    }
    return true;
  }

  recordSuccess() {
    this.state = CIRCUIT_STATE.CLOSED;
    this.consecutiveFailures = 0;
    this.cooldownMultiplier = 1;
    this.lastFailureTime = null;
  }

  recordFailure(failureType = FAILURE_TYPE.TRANSIENT) {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    // Deprecation and Auth Fatal trip the breaker immediately
    if (failureType === FAILURE_TYPE.DEPRECATION || failureType === FAILURE_TYPE.AUTH_FATAL) {
      this.state = CIRCUIT_STATE.OPEN;
      this.nextAllowedTime = Date.now() + this.maxCooldownMs;
      return;
    }

    if (this.consecutiveFailures >= this.failureThreshold || this.state === CIRCUIT_STATE.HALF_OPEN) {
      this.state = CIRCUIT_STATE.OPEN;
      const wait = Math.min(this.cooldownMs * this.cooldownMultiplier, this.maxCooldownMs);
      this.nextAllowedTime = Date.now() + wait;
      this.cooldownMultiplier = Math.min(this.cooldownMultiplier * 2, 10);
    }
  }

  reset() {
    this.state = CIRCUIT_STATE.CLOSED;
    this.consecutiveFailures = 0;
    this.cooldownMultiplier = 1;
    this.lastFailureTime = null;
    this.nextAllowedTime = 0;
  }
}

class RoutingPolicy {
  constructor(options = {}) {
    this.billingClassifier = options.billingClassifier || defaultBillingClassifier;
    this.capabilityEvaluator = options.capabilityEvaluator || defaultCapabilityEvaluator;
    this.circuitBreakers = new Map(); // key -> CircuitBreaker
    this.maxRetries = options.maxRetries ?? 3;
    this.excludePaid = options.excludePaid ?? false;
  }

  getCircuitBreaker(provider, model) {
    const key = `${provider}/${model}`.toLowerCase();
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker());
    }
    return this.circuitBreakers.get(key);
  }

  classifyFailure(error, responseBody = null, statusCode = null) {
    const errText = [
      error?.message || "",
      typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody || ""),
      String(statusCode || "")
    ].join(" ").toLowerCase();

    // Deprecation string signature detection (e.g. Google Cloud Code / Antigravity deprecation)
    if (
      errText.includes("no longer supported") ||
      errText.includes("unsupported client version") ||
      errText.includes("version is deprecated") ||
      errText.includes("upgrade your client") ||
      errText.includes("client version is no longer supported")
    ) {
      return FAILURE_TYPE.DEPRECATION;
    }

    // Auth fatal
    if (
      statusCode === 401 ||
      statusCode === 403 ||
      errText.includes("unauthorized") ||
      errText.includes("invalid api key") ||
      errText.includes("revoked") ||
      errText.includes("account suspended")
    ) {
      return FAILURE_TYPE.AUTH_FATAL;
    }

    // Incapable (model limitation)
    if (
      errText.includes("maximum context length") ||
      errText.includes("context_length_exceeded") ||
      errText.includes("tools are not supported") ||
      errText.includes("schema not supported") ||
      errText.includes("function calling not supported")
    ) {
      return FAILURE_TYPE.INCAPABLE;
    }

    // Provider down
    if (
      errText.includes("econnrefused") ||
      errText.includes("enotfound") ||
      errText.includes("getaddrinfo")
    ) {
      return FAILURE_TYPE.PROVIDER_DOWN;
    }

    // Transient rate limit / overload
    return FAILURE_TYPE.TRANSIENT;
  }

  orderCandidates(candidates = [], requiredProfile = null) {
    if (!Array.isArray(candidates)) return [];

    return [...candidates].sort((a, b) => {
      const pA = a.provider || (a.model ? a.model.split("/")[0] : "");
      const mA = a.model || a.id || "";
      const pB = b.provider || (b.model ? b.model.split("/")[0] : "");
      const mB = b.model || b.id || "";

      // 1. Circuit breaker availability check
      const cbA = this.getCircuitBreaker(pA, mA).isAvailable();
      const cbB = this.getCircuitBreaker(pB, mB).isAvailable();
      if (cbA && !cbB) return -1;
      if (!cbA && cbB) return 1;

      // 2. Billing priority waterfall
      // Priority rank: ZERO_MARGINAL_COST (1) = SUBSCRIPTION_ENTITLED (1) > PROMOTIONAL (2) > PAID_TOKEN (3) > PAY_AS_YOU_GO (4)
      const bClassA = this.billingClassifier.classify(pA, mA);
      const bClassB = this.billingClassifier.classify(pB, mB);

      const isFreeA = (bClassA === BILLING_CLASSES.ZERO_MARGINAL_COST || bClassA === BILLING_CLASSES.SUBSCRIPTION_ENTITLED);
      const isFreeB = (bClassB === BILLING_CLASSES.ZERO_MARGINAL_COST || bClassB === BILLING_CLASSES.SUBSCRIPTION_ENTITLED);

      if (isFreeA && !isFreeB) return -1;
      if (!isFreeA && isFreeB) return 1;

      // 3. Profile-specific score
      if (requiredProfile) {
        const scoreA = this.capabilityEvaluator.scoreForProfile(pA, mA, requiredProfile);
        const scoreB = this.capabilityEvaluator.scoreForProfile(pB, mB, requiredProfile);
        if (Math.abs(scoreB - scoreA) > 0.05) {
          return scoreB - scoreA;
        }
      }

      // 4. Fallback to existing candidate order or priority attribute
      const prioA = a.priority ?? 0;
      const prioB = b.priority ?? 0;
      return prioB - prioA;
    });
  }

  selectCandidate({ candidates = [], requiredProfile = null, excludePaid = null }) {
    const shouldExcludePaid = excludePaid ?? this.excludePaid;
    const ordered = this.orderCandidates(candidates, requiredProfile);

    for (const c of ordered) {
      const p = c.provider || (c.model ? c.model.split("/")[0] : "");
      const m = c.model || c.id || "";

      if (shouldExcludePaid && !this.billingClassifier.isSafeUnderFreeOnly(p, m, true)) {
        continue;
      }

      if (this.getCircuitBreaker(p, m).isAvailable()) {
        return c;
      }
    }

    return null;
  }
}

const defaultRoutingPolicy = new RoutingPolicy();

module.exports = {
  CIRCUIT_STATE,
  FAILURE_TYPE,
  CircuitBreaker,
  RoutingPolicy,
  defaultRoutingPolicy
};
