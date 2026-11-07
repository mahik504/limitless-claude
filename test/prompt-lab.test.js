const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs");
const os = require("os");

const { PromptLab } = require("../src/core/prompt-lab");

test.describe("Limitless Claude 8.0 - Prompt Laboratory Suite", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "limitless-v8-prompt-lab-"));
  const historyFile = path.join(tempDir, "prompt-lab-history.json");
  const lab = new PromptLab({ historyFile });

  test.it("Fixture Evaluation - should execute standard fixtures and record metrics", () => {
    // Mock executor that passes all fixtures
    const mockExecutor = (fixture) => {
      switch (fixture.id) {
        case "fixture-01-syntax-fix":
          return "const obj = { a: 1, b: 2 };";
        case "fixture-02-backend-rls":
          return "CREATE POLICY select_own ON documents FOR SELECT USING (auth.uid() = user_id);";
        case "fixture-03-r3f-cleanup":
          return "useEffect(() => { return () => { geometry.dispose(); material.dispose(); }; }, []);";
        case "fixture-04-hostile-review":
          return "CRITICAL: Hardcoded API credential secret detected! Severe security vulnerability.";
        default:
          return "ok";
      }
    };

    const runA = lab.evaluatePromptVariant("variant-A-baseline", { capability: "balanced" }, mockExecutor);

    assert.equal(runA.avgScore, 100);
    assert.equal(runA.fixturesPassed, 4);
    assert.ok(runA.promptHash);

    // Mock executor that fails on hostile review
    const mockExecutorDegraded = (fixture) => {
      if (fixture.id === "fixture-04-hostile-review") {
        return "Looks good to me!"; // Misses secret leak
      }
      return mockExecutor(fixture);
    };

    const runB = lab.evaluatePromptVariant("variant-B-candidate", { capability: "balanced" }, mockExecutorDegraded);
    assert.equal(runB.avgScore, 75);
    assert.equal(runB.fixturesPassed, 3);

    // A/B comparison and regression check
    const comparison = lab.compareVariants("variant-A-baseline", "variant-B-candidate");
    assert.equal(comparison.hasRegression, true);
    assert.equal(comparison.verdict, "REGRESSION_DETECTED");
    assert.equal(comparison.scoreDelta, -25);
  });

  // Cleanup
  test.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
