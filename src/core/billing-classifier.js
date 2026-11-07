/**
 * Limitless Claude 8.0 - Billing & Quota Intelligence Classifier
 * 
 * Accurately classifies provider models into verifiable billing categories.
 * Prevents accidental invocation of chargeable or unverified endpoints.
 * 
 * Categories:
 * - provider_free_quota: Free tier provided by vendor with rate limits (Groq, Cloudflare AI, etc.)
 * - subscription-entitled: Flat monthly fee covering inference (GitHub Copilot, Kiro, Antigravity)
 * - promotional: Temporary trial credits
 * - paid-token: Metered per-token commercial APIs (OpenAI, Anthropic, Mistral, OpenRouter paid)
 * - pay-as-you-go: Metered prepaid/postpaid router accounts (OpenCode Zen)
 * - local: Self-hosted zero-dollar inference (Ollama, vLLM)
 * - unknown: Pricing cannot be determined (strictly excluded from free-only mode)
 */

const BILLING_CLASSES = {
  PROVIDER_FREE_QUOTA: "provider_free_quota",
  SUBSCRIPTION_ENTITLED: "subscription-entitled",
  PAID_TOKEN: "paid-token",
  PAY_AS_YOU_GO: "pay-as-you-go",
  PROMOTIONAL: "promotional",
  LOCAL: "local",
  UNKNOWN: "unknown",
  // Backward compatibility alias for 7.0 code & tests
  ZERO_MARGINAL_COST: "provider_free_quota"
};

// Verified pricing reference per 1M tokens (USD)
const KNOWN_PRICING_PER_M = {
  "mistral/codestral-latest": { input: 0.30, output: 0.90 },
  "openrouter/anthropic/claude-3.5-sonnet": { input: 3.00, output: 15.00 },
  "openrouter/deepseek/deepseek-chat": { input: 0.14, output: 0.28 },
  "openrouter/qwen/qwen-2.5-coder-32b-instruct": { input: 0.08, output: 0.16 },
  "github/gpt-4o": { input: 0.00, output: 0.00, subscription: true },
  "github/gpt-4o-mini": { input: 0.00, output: 0.00, subscription: true },
  "kiro/claude-sonnet-4.5": { input: 0.00, output: 0.00, subscription: true },
  "kiro/deepseek-3.2": { input: 0.00, output: 0.00, subscription: true },
  "kiro/glm-5": { input: 0.00, output: 0.00, subscription: true },
  "kiro/qwen3-coder-next": { input: 0.00, output: 0.00, subscription: true }
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
      return BILLING_CLASSES.PROVIDER_FREE_QUOTA;
    }

    // 3. Subscription-entitled accounts (seat covers inference, no per-token charges)
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

    // 7. Verified developer free quota endpoints with vendor daily/minute limits
    if (["cloudflare-ai", "cf", "groq", "kilo-gateway", "kg", "ollama-cloud", "ollamacloud", "cerebras", "nvidia"].includes(p)) {
      return BILLING_CLASSES.PROVIDER_FREE_QUOTA;
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
    const classification = this.classify(provider, model);

    // Free classes return 0.0
    if (
      classification === BILLING_CLASSES.PROVIDER_FREE_QUOTA ||
      classification === BILLING_CLASSES.SUBSCRIPTION_ENTITLED ||
      classification === BILLING_CLASSES.LOCAL
    ) {
      return 0.0;
    }

    const key = `${provider}/${model}`.toLowerCase();
    const pricing = KNOWN_PRICING_PER_M[key];

    if (pricing) {
      if (pricing.subscription) return 0.0;
      const inCost = (inputTokens / 1_000_000) * pricing.input;
      const outCost = (outputTokens / 1_000_000) * pricing.output;
      return parseFloat((inCost + outCost).toFixed(6));
    }

    // Unknown pricing must NOT return 0.0 (financial hazard)
    return null;
  }

  estimateCostDetailed(provider, model, inputTokens = 0, outputTokens = 0) {
    const classification = this.classify(provider, model);
    const cost = this.estimateCost(provider, model, inputTokens, outputTokens);

    return {
      provider,
      model,
      billingClass: classification,
      cost,
      status: cost === null ? "unknown" : (cost === 0 ? "free" : "metered"),
      currency: "USD"
    };
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
