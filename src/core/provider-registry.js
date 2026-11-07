/**
 * Limitless Claude 7.0 - Provider Registry
 * 
 * Manages upstream provider connections, credentials inspection (redacted),
 * authentication types, priority weighting, and discovery.
 */

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(name, config = {}) {
    const key = String(name).toLowerCase();
    const entry = {
      name: key,
      displayName: config.displayName || name,
      authType: config.authType || "api-key",
      isActive: config.isActive ?? true,
      priority: config.priority ?? 0,
      supportsStreaming: config.supportsStreaming ?? true,
      supportsTools: config.supportsTools ?? true,
      rateLimitedUntil: config.rateLimitedUntil || null,
      lastError: config.lastError || null,
      lastPingAt: config.lastPingAt || null,
      metadata: config.metadata || {}
    };

    this.providers.set(key, entry);
    return entry;
  }

  get(name) {
    if (!name) return null;
    return this.providers.get(String(name).toLowerCase()) || null;
  }

  isAvailable(name) {
    const p = this.get(name);
    if (!p) return false;
    if (!p.isActive) return false;
    if (p.rateLimitedUntil) {
      const resetTime = new Date(p.rateLimitedUntil).getTime();
      if (!isNaN(resetTime) && resetTime > Date.now()) {
        return false;
      }
    }
    return true;
  }

  loadFromDatabase(db) {
    try {
      const rows = db.prepare(
        "SELECT id, provider, auth_type, display_name, priority, is_active, rate_limited_until, last_error FROM provider_connections"
      ).all();

      for (const r of rows) {
        this.registerProvider(r.provider, {
          displayName: r.display_name,
          authType: r.auth_type,
          priority: r.priority,
          isActive: r.is_active === 1,
          rateLimitedUntil: r.rate_limited_until,
          lastError: r.last_error
        });
      }
      return this.providers.size;
    } catch (_) {
      return 0;
    }
  }

  getAll() {
    return Array.from(this.providers.values());
  }

  getActiveProviders() {
    return Array.from(this.providers.values()).filter(p => this.isAvailable(p.name));
  }
}

const defaultProviderRegistry = new ProviderRegistry();

module.exports = {
  ProviderRegistry,
  defaultProviderRegistry
};
