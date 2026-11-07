const test = require("node:test");
const assert = require("node:assert/strict");

const { TokenTracker } = require("../src/core/token-tracker");

test.describe("Limitless Claude 8.2 - Token & Savings Telemetry Suite", () => {

  test.it("Offline Database - handles null / missing db gracefully", () => {
    const tracker = new TokenTracker({});
    tracker.getDb = () => null;

    const data = tracker.getTelemetry();
    assert.equal(data.available, false);
    assert.equal(data.totalCalls, 0);
    assert.equal(data.totalTokens, 0);
    assert.equal(data.costSavingsUsd || 0, 0);
  });

  test.it("Mock Database - accurately aggregates tokens and calculates Anthropic cost savings", () => {
    const mockDb = {
      prepare: (sql) => {
        if (sql.includes("FROM call_logs") && sql.includes("COUNT(*) as count")) {
          return {
            get: () => ({ count: 100, in_tok: 1_000_000, out_tok: 100_000, reasoning_tok: 5_000 })
          };
        }
        if (sql.includes("FROM call_logs") && sql.includes("GROUP BY combo_name")) {
          return {
            all: () => [
              { name: "Limitless Opus 5.5 Tier", calls: 60, in_tok: 800_000, out_tok: 80_000 },
              { name: "Limitless Sonnet 5.5 Tier", calls: 40, in_tok: 200_000, out_tok: 20_000 }
            ]
          };
        }
        if (sql.includes("FROM call_logs") && sql.includes("GROUP BY provider")) {
          return {
            all: () => [
              { provider: "kiro", calls: 80, in_tok: 900_000, out_tok: 90_000 },
              { provider: "github", calls: 20, in_tok: 100_000, out_tok: 10_000 }
            ]
          };
        }
        if (sql.includes("FROM daily_usage_summary")) {
          return {
            all: () => []
          };
        }
        return { get: () => null, all: () => [] };
      }
    };

    const tracker = new TokenTracker(mockDb);
    const result = tracker.getTelemetry({ db: mockDb });

    assert.equal(result.available, true);
    assert.equal(result.totalCalls, 100);
    assert.equal(result.totalInputTokens, 1_000_000);
    assert.equal(result.totalOutputTokens, 100_000);
    assert.equal(result.totalTokens, 1_100_000);

    // 1M input * $3/M = $3.00, 0.1M output * $15/M = $1.50 => Sonnet Equiv = $4.50
    assert.equal(result.costSavings.sonnetEquivUsd, 4.50);

    // 1M input * $15/M = $15.00, 0.1M output * $75/M = $7.50 => Opus Equiv = $22.50
    assert.equal(result.costSavings.opusEquivUsd, 22.50);

    assert.ok(result.combos["Limitless Opus 5.5 Tier"]);
    assert.equal(result.combos["Limitless Opus 5.5 Tier"].calls, 60);
    assert.ok(result.providers["kiro"]);
    assert.equal(result.providers["kiro"].calls, 80);
  });

});
