/**
 * Limitless Claude 7.0 - Telemetry & Observability Engine
 * 
 * Aggregates runtime telemetry from OmniRoute database:
 * - Request volume, error rates, p50/p95 latency
 * - Token throughput and cost estimations
 * - Upstream provider health and rate limit states
 * - Output redaction for secure dashboard display
 */

const { defaultBillingClassifier } = require("./billing-classifier");
const { redactSecret } = require("../utils/redact");

class TelemetryEngine {
  constructor(options = {}) {
    this.billingClassifier = options.billingClassifier || defaultBillingClassifier;
  }

  getMetrics(db) {
    if (!db) {
      return {
        totalCalls: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0,
        p50LatencyMs: 0,
        p95LatencyMs: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        estimatedCostUsd: 0.0,
        providerStats: [],
        comboStats: []
      };
    }

    try {
      // 1. Query call logs
      let callRows = [];
      try {
        callRows = db.prepare(`
          SELECT 
            id,
            provider,
            model,
            status_code,
            latency_ms,
            input_tokens,
            output_tokens,
            created_at
          FROM call_logs
          ORDER BY id DESC
          LIMIT 500
        `).all();
      } catch (_) {
        // call_logs table might have different schema or be empty
      }

      let totalCalls = callRows.length;
      let successCount = 0;
      let errorCount = 0;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let estimatedCostUsd = 0.0;
      const latencies = [];

      for (const row of callRows) {
        if (row.status_code >= 200 && row.status_code < 400) {
          successCount++;
        } else {
          errorCount++;
        }

        if (row.latency_ms) latencies.push(row.latency_ms);
        const inTok = row.input_tokens || 0;
        const outTok = row.output_tokens || 0;
        totalInputTokens += inTok;
        totalOutputTokens += outTok;

        const cost = this.billingClassifier.estimateCost(row.provider, row.model, inTok, outTok);
        estimatedCostUsd += cost;
      }

      latencies.sort((a, b) => a - b);
      const p50LatencyMs = latencies.length ? latencies[Math.floor(latencies.length * 0.5)] : 0;
      const p95LatencyMs = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
      const successRate = totalCalls > 0 ? (successCount / totalCalls) * 100 : 100;

      // 2. Query provider connections
      let providerStats = [];
      try {
        providerStats = db.prepare(`
          SELECT id, provider, auth_type, display_name, priority, is_active, rate_limited_until, last_error
          FROM provider_connections
        `).all();
      } catch (_) {}

      // 3. Query combos
      let comboStats = [];
      try {
        comboStats = db.prepare(`
          SELECT id, name, system_message, data
          FROM combos
        `).all();
      } catch (_) {}

      return {
        totalCalls,
        successCount,
        errorCount,
        successRate: parseFloat(successRate.toFixed(1)),
        p50LatencyMs,
        p95LatencyMs,
        totalInputTokens,
        totalOutputTokens,
        estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(4)),
        providerStats: providerStats.map(p => ({
          provider: p.provider,
          displayName: p.display_name,
          isActive: p.is_active === 1,
          priority: p.priority,
          rateLimitedUntil: p.rate_limited_until,
          lastError: p.last_error ? redactSecret(p.last_error) : null
        })),
        comboStats: comboStats.map(c => {
          let modelList = [];
          try {
            const parsed = JSON.parse(c.data);
            if (Array.isArray(parsed.models)) modelList = parsed.models;
          } catch (_) {}
          return {
            id: c.id,
            name: c.name,
            modelCount: modelList.length
          };
        })
      };
    } catch (err) {
      return {
        error: err.message,
        totalCalls: 0,
        successRate: 0,
        providerStats: [],
        comboStats: []
      };
    }
  }
}

const defaultTelemetryEngine = new TelemetryEngine();

module.exports = {
  TelemetryEngine,
  defaultTelemetryEngine
};
