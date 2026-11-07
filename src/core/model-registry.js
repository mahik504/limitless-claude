/**
 * Limitless Claude 7.0 - Model Registry & Health State
 * 
 * Tracks model lifecycle stages:
 * - DISCOVERED
 * - AUTHENTICATED
 * - AVAILABLE
 * - SMOKE_TESTED
 * - TOOL_TESTED
 * - BENCHMARK_TESTED
 * - PRODUCTION_APPROVED
 */

const MODEL_STAGES = {
  DISCOVERED: "discovered",
  AUTHENTICATED: "authenticated",
  AVAILABLE: "available",
  SMOKE_TESTED: "smoke-tested",
  TOOL_TESTED: "tool-tested",
  BENCHMARK_TESTED: "benchmark-tested",
  PRODUCTION_APPROVED: "production-approved"
};

const HEALTH_STATUS = {
  HEALTHY: "HEALTHY",
  DEGRADED: "DEGRADED",
  UNAVAILABLE: "UNAVAILABLE",
  UNKNOWN: "UNKNOWN"
};

class ModelRegistry {
  constructor() {
    this.models = new Map(); // key -> ModelEntry
  }

  register(provider, model, options = {}) {
    const key = `${provider}/${model}`.toLowerCase();
    const entry = {
      key,
      provider,
      model,
      displayName: options.displayName || `${provider}/${model}`,
      stage: options.stage || MODEL_STAGES.DISCOVERED,
      health: options.health || HEALTH_STATUS.UNKNOWN,
      billing: options.billing || "unknown",
      contextWindow: options.contextWindow || 128000,
      supportsTools: options.supportsTools ?? true,
      lastTested: options.lastTested || null,
      lastError: options.lastError || null,
      latencyMs: options.latencyMs || null,
      metadata: options.metadata || {}
    };

    this.models.set(key, entry);
    return entry;
  }

  get(provider, model) {
    const key = `${provider}/${model}`.toLowerCase();
    return this.models.get(key) || null;
  }

  has(provider, model) {
    const key = `${provider}/${model}`.toLowerCase();
    return this.models.has(key);
  }

  updateHealth(provider, model, health, error = null, latencyMs = null) {
    const key = `${provider}/${model}`.toLowerCase();
    const entry = this.models.get(key);
    if (!entry) return;

    entry.health = health;
    entry.lastTested = new Date().toISOString();
    if (error) entry.lastError = error;
    if (latencyMs !== null) entry.latencyMs = latencyMs;

    if (health === HEALTH_STATUS.HEALTHY) {
      if (entry.stage === MODEL_STAGES.DISCOVERED) {
        entry.stage = MODEL_STAGES.AVAILABLE;
      }
    }
  }

  promoteStage(provider, model, newStage) {
    const key = `${provider}/${model}`.toLowerCase();
    const entry = this.models.get(key);
    if (entry) {
      entry.stage = newStage;
    }
  }

  getApprovedModels() {
    return Array.from(this.models.values()).filter(
      m => m.health === HEALTH_STATUS.HEALTHY && m.stage !== MODEL_STAGES.DISCOVERED
    );
  }

  getAll() {
    return Array.from(this.models.values());
  }

  clear() {
    this.models.clear();
  }
}

const defaultRegistry = new ModelRegistry();

module.exports = {
  MODEL_STAGES,
  HEALTH_STATUS,
  ModelRegistry,
  defaultRegistry
};
