const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs");
const os = require("os");

const { CAPABILITY_PROFILES, LIFECYCLE_STATES, CapabilityEvaluator } = require("../src/core/capability-evaluator");
const { BILLING_CLASSES, BillingClassifier } = require("../src/core/billing-classifier");
const { ConfigManager } = require("../src/core/config-manager");

test.describe("Limitless Claude 8.0 - Critical Correctness & Security Suite", () => {

  test.it("CapabilityEvaluator - should govern model lifecycle stages and isolate heuristic priors", () => {
    const evaluator = new CapabilityEvaluator();

    // 1. Empirical catalogued model should be production approved
    const sonnet = evaluator.evaluateModel("kiro", "claude-sonnet-4.5");
    assert.equal(sonnet.lifecycle, LIFECYCLE_STATES.PRODUCTION_APPROVED);
    assert.equal(sonnet.isEmpirical, true);
    assert.equal(evaluator.isProductionEligible("kiro", "claude-sonnet-4.5"), true);

    // 2. Uncatalogued model should be marked ESTIMATED with isEmpirical = false
    const unknownCoder = evaluator.evaluateModel("custom-provider", "mystery-coder-99b");
    assert.equal(unknownCoder.lifecycle, LIFECYCLE_STATES.ESTIMATED);
    assert.equal(unknownCoder.isEmpirical, false);
    assert.ok(unknownCoder.heuristicPrior);
    assert.equal(evaluator.isProductionEligible("custom-provider", "mystery-coder-99b"), false);

    // 3. Smoke test promotion
    evaluator.recordSmokeTest("custom-provider", "mystery-coder-99b", true);
    assert.equal(evaluator.evaluateModel("custom-provider", "mystery-coder-99b").lifecycle, LIFECYCLE_STATES.SMOKE_TESTED);

    // 4. Tool test promotion
    evaluator.recordToolTest("custom-provider", "mystery-coder-99b", true);
    assert.equal(evaluator.evaluateModel("custom-provider", "mystery-coder-99b").lifecycle, LIFECYCLE_STATES.TOOL_TESTED);

    // 5. Benchmark recording
    evaluator.recordBenchmark("custom-provider", "mystery-coder-99b", { coding: 9.1, reasoning: 8.9 });
    const benched = evaluator.evaluateModel("custom-provider", "mystery-coder-99b");
    assert.equal(benched.lifecycle, LIFECYCLE_STATES.BENCHMARKED);
    assert.equal(benched.isEmpirical, true);
    assert.equal(benched.coding, 9.1);

    // 6. Production approval
    evaluator.approveForProduction("custom-provider", "mystery-coder-99b");
    assert.equal(evaluator.evaluateModel("custom-provider", "mystery-coder-99b").lifecycle, LIFECYCLE_STATES.PRODUCTION_APPROVED);
    assert.equal(evaluator.isProductionEligible("custom-provider", "mystery-coder-99b"), true);

    // 7. Quarantine on failure
    evaluator.quarantine("custom-provider", "mystery-coder-99b", "Produced invalid JSON repeatedly");
    assert.equal(evaluator.evaluateModel("custom-provider", "mystery-coder-99b").lifecycle, LIFECYCLE_STATES.QUARANTINED);
    assert.equal(evaluator.isProductionEligible("custom-provider", "mystery-coder-99b"), false);
  });

  test.it("BillingClassifier - should never return $0.00 for unknown models and enforce safe free-only mode", () => {
    const classifier = new BillingClassifier();

    // 1. Classification taxonomy
    assert.equal(classifier.classify("groq", "llama-3.3-70b-versatile"), BILLING_CLASSES.PROVIDER_FREE_QUOTA);
    assert.equal(classifier.classify("cerebras", "llama3.1-8b"), BILLING_CLASSES.PROVIDER_FREE_QUOTA);
    assert.equal(classifier.classify("github", "gpt-4o"), BILLING_CLASSES.SUBSCRIPTION_ENTITLED);
    assert.equal(classifier.classify("openrouter", "deepseek/deepseek-chat"), BILLING_CLASSES.PAID_TOKEN);
    assert.equal(classifier.classify("unregistered-host", "some-model"), BILLING_CLASSES.UNKNOWN);

    // 2. estimateCost on known models
    assert.equal(classifier.estimateCost("groq", "llama-3.3-70b-versatile", 1000, 1000), 0.0);
    assert.equal(classifier.estimateCost("github", "gpt-4o", 1000, 1000), 0.0);
    assert.equal(classifier.estimateCost("mistral", "codestral-latest", 1_000_000, 1_000_000), 1.20);

    // 3. estimateCost on unknown model MUST return null, never 0.0
    const unknownCost = classifier.estimateCost("unregistered-host", "some-unknown-model", 1000, 1000);
    assert.equal(unknownCost, null);

    const detailed = classifier.estimateCostDetailed("unregistered-host", "some-unknown-model", 1000, 1000);
    assert.equal(detailed.status, "unknown");
    assert.equal(detailed.cost, null);

    // 4. Free-only mode guard
    assert.equal(classifier.isSafeUnderFreeOnly("groq", "llama-3.3-70b-versatile"), true);
    assert.equal(classifier.isSafeUnderFreeOnly("openrouter", "deepseek/deepseek-chat"), false);
    assert.equal(classifier.isSafeUnderFreeOnly("unregistered-host", "some-unknown-model"), false);
    // Explicit override for unknown
    assert.equal(classifier.isSafeUnderFreeOnly("unregistered-host", "some-unknown-model", true), true);
  });

  test.it("ConfigManager - should create pre-switch snapshots and protect configuration state", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "limitless-v8-config-test-"));
    const configManager = new ConfigManager({
      projectRoot: tempDir,
      homeDir: tempDir
    });

    const snapshotId = configManager.createPreSwitchSnapshot("opencode-go");
    assert.ok(snapshotId.startsWith("pre-switch-opencode-go"));

    const snapshots = configManager.listSnapshots();
    assert.equal(snapshots.length, 1);
    assert.equal(snapshots[0].snapshotId, snapshotId);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

});
