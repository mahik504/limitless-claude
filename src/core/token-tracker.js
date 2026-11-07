/**
 * Limitless Claude - Token & Savings Telemetry Engine
 * 
 * Aggregates live token usage from storage.sqlite (call_logs and daily_usage_summary)
 * to compute token volume, provider breakdown, combo distribution, and estimated
 * dollar savings versus official direct Anthropic API list pricing.
 */

const { getDatabase } = require("../omniroute/db");

// Standard Anthropic List Pricing per 1M tokens ($ / M)
const ANTHROPIC_PRICING = {
  haiku: { input: 0.25, output: 1.25 },
  sonnet: { input: 3.00, output: 15.00 },
  opus: { input: 15.00, output: 75.00 }
};

class TokenTracker {
  constructor(db = null) {
    this._db = db;
  }

  getDb() {
    if (this._db) return this._db;
    try {
      this._db = getDatabase();
      return this._db;
    } catch (_) {
      return null;
    }
  }

  /**
   * Compute comprehensive token usage & cost savings metrics
   */
  getTelemetry(options = {}) {
    const db = options.db || this.getDb();
    if (!db) {
      return {
        available: false,
        totalCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        costSavingsUsd: 0,
        costSavings: { sonnetEquivUsd: 0, opusEquivUsd: 0, haikuEquivUsd: 0, blendedEquivUsd: 0 },
        financials: {
          actualBilledUsd: 0,
          estimatedProviderCostUsd: 0,
          counterfactualAnthropicUsd: { sonnetBaseline: 0, opusBaseline: 0, haikuBaseline: 0, blendedBaseline: 0 }
        },
        combos: {},
        providers: {},
        dailySummary: []
      };
    }

    try {
      // 1. Overall Aggregates from call_logs
      let overall = { count: 0, in_tok: 0, out_tok: 0, reasoning_tok: 0 };
      try {
        const row = db.prepare(`
          SELECT 
            COUNT(*) as count, 
            COALESCE(SUM(tokens_in), 0) as in_tok, 
            COALESCE(SUM(tokens_out), 0) as out_tok,
            COALESCE(SUM(tokens_reasoning), 0) as reasoning_tok
          FROM call_logs
        `).get();
        if (row) overall = row;
      } catch (_) {}

      // 2. Combo Breakdown
      const combos = {};
      try {
        const comboRows = db.prepare(`
          SELECT 
            COALESCE(combo_name, 'Direct / Custom') as name,
            COUNT(*) as calls,
            COALESCE(SUM(tokens_in), 0) as in_tok,
            COALESCE(SUM(tokens_out), 0) as out_tok
          FROM call_logs
          GROUP BY combo_name
          ORDER BY (SUM(tokens_in) + SUM(tokens_out)) DESC
        `).all();

        for (const r of comboRows) {
          combos[r.name] = {
            calls: r.calls,
            inputTokens: r.in_tok,
            outputTokens: r.out_tok,
            totalTokens: r.in_tok + r.out_tok
          };
        }
      } catch (_) {}

      // 3. Provider Breakdown
      const providers = {};
      try {
        const provRows = db.prepare(`
          SELECT 
            COALESCE(provider, 'unknown') as provider,
            COUNT(*) as calls,
            COALESCE(SUM(tokens_in), 0) as in_tok,
            COALESCE(SUM(tokens_out), 0) as out_tok
          FROM call_logs
          GROUP BY provider
          ORDER BY (SUM(tokens_in) + SUM(tokens_out)) DESC
        `).all();

        for (const r of provRows) {
          providers[r.provider] = {
            calls: r.calls,
            inputTokens: r.in_tok,
            outputTokens: r.out_tok,
            totalTokens: r.in_tok + r.out_tok
          };
        }
      } catch (_) {}

      // 4. Daily summaries (last 7 days)
      let dailySummary = [];
      try {
        dailySummary = db.prepare(`
          SELECT 
            date,
            SUM(total_requests) as requests,
            SUM(total_input_tokens) as in_tok,
            SUM(total_output_tokens) as out_tok,
            SUM(total_cost) as billed_cost
          FROM daily_usage_summary
          GROUP BY date
          ORDER BY date DESC
          LIMIT 7
        `).all() || [];
      } catch (_) {}

      // 5. Three-Layer Financial Model:
      // A. Actual Billed Cost
      let actualBilled = 0.00;
      for (const d of dailySummary) {
        if (d.billed_cost) actualBilled += Number(d.billed_cost);
      }

      // B. Counterfactual Anthropic Value (Hypothetical cost if routed to Anthropic list prices)
      const inM = overall.in_tok / 1_000_000;
      const outM = overall.out_tok / 1_000_000;
      
      const sonnetEquivCost = (inM * ANTHROPIC_PRICING.sonnet.input) + (outM * ANTHROPIC_PRICING.sonnet.output);
      const opusEquivCost = (inM * ANTHROPIC_PRICING.opus.input) + (outM * ANTHROPIC_PRICING.opus.output);
      const haikuEquivCost = (inM * ANTHROPIC_PRICING.haiku.input) + (outM * ANTHROPIC_PRICING.haiku.output);

      // Blended baseline (70% Sonnet, 20% Opus, 10% Haiku)
      const blendedAnthropicEquiv = (sonnetEquivCost * 0.70) + (opusEquivCost * 0.20) + (haikuEquivCost * 0.10);

      const sonnetRound = Number(sonnetEquivCost.toFixed(2));
      const opusRound = Number(opusEquivCost.toFixed(2));
      const haikuRound = Number(haikuEquivCost.toFixed(2));
      const blendedRound = Number(blendedAnthropicEquiv.toFixed(2));

      return {
        available: true,
        totalCalls: overall.count,
        totalInputTokens: overall.in_tok,
        totalOutputTokens: overall.out_tok,
        totalReasoningTokens: overall.reasoning_tok,
        totalTokens: overall.in_tok + overall.out_tok,
        financials: {
          actualBilledUsd: actualBilled,
          estimatedProviderCostUsd: actualBilled,
          counterfactualAnthropicUsd: {
            sonnetBaseline: sonnetRound,
            opusBaseline: opusRound,
            haikuBaseline: haikuRound,
            blendedBaseline: blendedRound
          }
        },
        costSavings: {
          sonnetEquivUsd: sonnetRound,
          opusEquivUsd: opusRound,
          haikuEquivUsd: haikuRound,
          blendedEquivUsd: blendedRound
        },
        combos,
        providers,
        dailySummary
      };
    } catch (e) {
      return {
        available: false,
        error: e.message,
        totalCalls: 0,
        totalTokens: 0,
        costSavings: { sonnetEquivUsd: 0, opusEquivUsd: 0, haikuEquivUsd: 0, blendedEquivUsd: 0 },
        financials: {
          actualBilledUsd: 0,
          estimatedProviderCostUsd: 0,
          counterfactualAnthropicUsd: { sonnetBaseline: 0, opusBaseline: 0, haikuBaseline: 0, blendedBaseline: 0 }
        },
        combos: {},
        providers: {},
        dailySummary: []
      };
    }
  }
}

const defaultTokenTracker = new TokenTracker();

module.exports = {
  TokenTracker,
  defaultTokenTracker,
  ANTHROPIC_PRICING
};
