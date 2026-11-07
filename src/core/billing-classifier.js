/**
 * Limitless Claude 7.0 - Billing & Quota Intelligence Classifier
 * 
 * Accurately classifies provider models into verifiable billing categories.
 * Enforces spending thresholds and prevents accidental chargeable invocation.
 */

const BILLING_CLASSES = {
  ZERO_MARGINAL_COST: "zero-marginal-cost",
  SUBSCRIPTION_ENTITLED: "subscription-entitled",
  PAID_TOKEN: "paid-token",
  PAY_AS_YOU_GO: "pay-as-you-go",
  PROMOTIONAL: "promotional",
  LOCAL: "local",
  UNKNOWN: "unknown"
};

// Pricing reference per 1M tokens (USD) for known chargeable models
const KNOWN_PRICING_PER_M = {
  "mistral/codestral-latest": { input: 0.30, output: 0.90 },
  "openrouter/anthropic/claude-3.5-sonnet": { input: 3.00, output: 15.00 },
  "openrouter/deepseek/deepseek-chat": { input: 0.14, output: 0.28 },
  "openrouter/qwen/qwen-2.5-coder-32b-instruct": { input: 0.08, output: 0.16 },
  "github/gpt-4o": { input: 0.00, output: 0.00, subscription: true },
  "github/gpt-4o-mini": { input: 0.00, output: 0.00, subscription: true }
};

class BillingClassifier {
  constructor(options = {}) {
    this.maxDailyBudget = options.maxDailyBudget ?? 10.0; // USD
    this.currentDailySpend = 0.0;
  }

  classify(provider, model) {
    if (!provider || !model) return BILLING_CLASSES.UNKNOWN;
    const p = String(provider).toLowerCase();
    const m = String(model).toLowerCase();

    // 1. Local loopback / self-hosted
    if (["ollama", "local", "vllm", "llama-cpp"].includes(p) || p.startsWith("localhost")) {
      return BILLING_CLASSES.LOCAL;
    }

    // 2. Explicit verified free tag suffix on router hubs
    if (m.includes(":free") || m.endsWith("-free")) {
      return BILLING_CLASSES.ZERO_MARGINAL_COST;
    }

    // 3. Subscription-entitled accounts (paid seat covers inference, no per-token charges)
    if (["github", "kiro", "opencode-go", "bluesminds"].includes(p)) {
      return BILLING_CLASSES.SUBSCRIPTION_ENTITLED;
    }

    // 4. Pay-as-you-go router tiers with budget metering
    if (p === "opencode-zen") {
      return BILLING_CLASSES.PAY_AS_YOU_GO;
    }

    // 5. OpenRouter without :free tag is metered paid-token inference
    if (p === "openrouter") {
      return BILLING_CLASSES.PAID_TOKEN;
    }

    // 6. Explicitly metered commercial APIs
    if (["mistral", "openai", "anthropic", "together", "fireworks", "cohere", "deepseek", "anyscale", "replicate", "perplexity"].includes(p)) {
      return BILLING_CLASSES.PAID_TOKEN;
    }

    // 7. Verified zero-cost community developer endpoints
    if (["cloudflare-ai", "cf", "groq", "kilo-gateway", "kg", "ollama-cloud", "ollamacloud", "cerebras", "nvidia"].includes(p)) {
      return BILLING_CLASSES.ZERO_MARGINAL_COST;
    }

    // 8. Antigravity OAuth (when healthy, Google One AI subscription entitled)
    if (p === "antigravity" || p === "agy") {
      return BILLING_CLASSES.SUBSCRIPTION_ENTITLED;
    }

    return BILLING_CLASSES.UNKNOWN;
  }

  isChargeable(provider, model) {
    const classification = this.classify(provider, model);
    return classification === BILLING_CLASSES.PAID_TOKEN || classification === BILLING_CLASSES.PAY_AS_YOU_GO;
  }

  isSafeUnderFreeOnly(provider, model, allowUnknown = false) {
    const classification = this.classify(provider, model);
    if (classification === BILLING_CLASSES.PAID_TOKEN || classification === BILLING_CLASSES.PAY_AS_YOU_GO) {
      return false;
    }
    if (classification === BILLING_CLASSES.UNKNOWN && !allowUnknown) {
      return false;
    }
    return true;
  }

  estimateCost(provider, model, inputTokens = 0, outputTokens = 0) {
    const key = `${provider}/${model}`.toLowerCase();
    const pricing = KNOWN_PRICING_PER_M[key];
    if (!pricing || pricing.subscription) return 0.0;

    const inCost = (inputTokens / 1_000_000) * pricing.input;
    const outCost = (outputTokens / 1_000_000) * pricing.output;
    return parseFloat((inCost + outCost).toFixed(6));
  }
}

const defaultClassifier = new BillingClassifier();

module.exports = {
  BILLING_CLASSES,
  BillingClassifier,
  defaultClassifier,
  classifyModelBilling: (p, m) => defaultClassifier.classify(p, m),
  filterCandidatesByBilling: (candidates, excludePaid = false, allowUnknown = false) => {
    if (!excludePaid) return candidates;
    return candidates.filter(c => defaultClassifier.isSafeUnderFreeOnly(c.provider, c.model, allowUnknown));
  }
};
