const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { BILLING_CLASSES, BillingClassifier } = require("../src/core/billing-classifier");
const { CAPABILITY_PROFILES, CapabilityEvaluator } = require("../src/core/capability-evaluator");
const { MODEL_STAGES, HEALTH_STATUS, ModelRegistry } = require("../src/core/model-registry");
const { ProviderRegistry } = require("../src/core/provider-registry");
const { CIRCUIT_STATE, FAILURE_TYPE, CircuitBreaker, RoutingPolicy } = require("../src/core/routing-policy");
const { FallbackEngine, DEPRECATION_PATTERNS } = require("../src/core/fallback-engine");
const { CLIENT_TYPES, AgentClientManager } = require("../src/core/agent-client");
const { PROFILES, ConfigManager } = require("../src/core/config-manager");
const { TelemetryEngine } = require("../src/core/telemetry");
const { BENCHMARK_TASKS, BenchmarkEngine } = require("../src/core/benchmark-engine");
const { getProfile, listProfiles } = require("../src/profiles");
const { redactSecret, maskApiKey } = require("../src/utils/redact");

test.describe("Limitless Claude 7.0 - Core Intelligence Suite", () => {

  test.it("Redaction Utility - should properly mask API keys and redact secrets", () => {
    assert.equal(maskApiKey(""), "[REDACTED]");
    assert.equal(maskApiKey("short"), "[REDACTED]");
    assert.equal(maskApiKey("sk-ant-api03-1234567890abcdef"), "sk-...def");

    const textWithSecret = "Error connecting with Bearer secret-token-xyz123 to upstream";
    const redacted = redactSecret(textWithSecret);
    assert.doesNotMatch(redacted, /secret-token-xyz123/);
    assert.match(redacted, /\[REDACTED\]/);
  });

  test.it("BillingClassifier - should categorize models into correct billing tiers", () => {
    const classifier = new BillingClassifier();

    assert.equal(classifier.classify("cloudflare-ai", "@cf/meta/llama-3.3-70b-instruct-fp8-fast"), BILLING_CLASSES.ZERO_MARGINAL_COST);
    assert.equal(classifier.classify("openrouter", "nvidia/nemotron-3.5-lightning:free"), BILLING_CLASSES.ZERO_MARGINAL_COST);
    assert.equal(classifier.classify("github", "gpt-4o"), BILLING_CLASSES.SUBSCRIPTION_ENTITLED);
    assert.equal(classifier.classify("kiro", "claude-sonnet-4.5"), BILLING_CLASSES.SUBSCRIPTION_ENTITLED);
    assert.equal(classifier.classify("antigravity", "claude-opus-4-6-thinking"), BILLING_CLASSES.SUBSCRIPTION_ENTITLED);
    assert.equal(classifier.classify("mistral", "codestral-latest"), BILLING_CLASSES.PAID_TOKEN);
    assert.equal(classifier.classify("openrouter", "anthropic/claude-3.5-sonnet"), BILLING_CLASSES.PAID_TOKEN);
    assert.equal(classifier.classify("opencode-zen", "deepseek-chat"), BILLING_CLASSES.PAY_AS_YOU_GO);
    assert.equal(classifier.classify("ollama", "qwen2.5-coder"), BILLING_CLASSES.LOCAL);

    assert.equal(classifier.isChargeable("mistral", "codestral-latest"), true);
    assert.equal(classifier.isChargeable("github", "gpt-4o"), false);
    assert.equal(classifier.isSafeUnderFreeOnly("cloudflare-ai", "llama-3"), true);
    assert.equal(classifier.isSafeUnderFreeOnly("mistral", "codestral-latest"), false);

    const cost = classifier.estimateCost("mistral", "codestral-latest", 1000000, 1000000);
    assert.equal(cost, 1.20);
  });

  test.it("CapabilityEvaluator - should map models to capability profiles accurately", () => {
    const evaluator = new CapabilityEvaluator();

    const fastModels = evaluator.getTopModelsForProfile(CAPABILITY_PROFILES.FAST, 3);
    assert.ok(fastModels.length > 0);

    const scoreCodestral = evaluator.scoreForProfile("mistral", "codestral-latest", CAPABILITY_PROFILES.BACKEND);
    assert.ok(scoreCodestral >= 9.0);

    const profile = evaluator.evaluateModel("kiro", "claude-sonnet-4.5");
    assert.ok(profile.coding >= 9.0);
    assert.ok(profile.reasoning >= 9.0);
  });

  test.it("ModelRegistry - should track lifecycle stages and health transitions", () => {
    const registry = new ModelRegistry();

    const entry = registry.register("github", "gpt-4o-mini", { displayName: "GitHub GPT-4o Mini" });
    assert.equal(entry.stage, MODEL_STAGES.DISCOVERED);
    assert.equal(entry.health, HEALTH_STATUS.UNKNOWN);

    registry.updateHealth("github", "gpt-4o-mini", HEALTH_STATUS.HEALTHY, null, 250);
    const updated = registry.get("github", "gpt-4o-mini");
    assert.equal(updated.health, HEALTH_STATUS.HEALTHY);
    assert.equal(updated.stage, MODEL_STAGES.AVAILABLE);
    assert.equal(updated.latencyMs, 250);

    registry.promoteStage("github", "gpt-4o-mini", MODEL_STAGES.PRODUCTION_APPROVED);
    assert.equal(registry.get("github", "gpt-4o-mini").stage, MODEL_STAGES.PRODUCTION_APPROVED);

    const approved = registry.getApprovedModels();
    assert.equal(approved.length, 1);
  });

  test.it("ProviderRegistry - should manage provider health and rate limiting", () => {
    const registry = new ProviderRegistry();

    registry.registerProvider("cloudflare-ai", { priority: 10, isActive: true });
    assert.equal(registry.isAvailable("cloudflare-ai"), true);

    const futureReset = new Date(Date.now() + 60000).toISOString();
    registry.registerProvider("ratelimited-prov", { isActive: true, rateLimitedUntil: futureReset });
    assert.equal(registry.isAvailable("ratelimited-prov"), false);
  });

  test.it("RoutingPolicy & CircuitBreaker - should trip on consecutive failures and deprecations", () => {
    const policy = new RoutingPolicy();
    const breaker = policy.getCircuitBreaker("test-prov", "test-model");

    assert.equal(breaker.state, CIRCUIT_STATE.CLOSED);
    assert.equal(breaker.isAvailable(), true);

    // Record transient failures
    breaker.recordFailure(FAILURE_TYPE.TRANSIENT);
    breaker.recordFailure(FAILURE_TYPE.TRANSIENT);
    assert.equal(breaker.state, CIRCUIT_STATE.CLOSED);

    // Third failure trips to OPEN
    breaker.recordFailure(FAILURE_TYPE.TRANSIENT);
    assert.equal(breaker.state, CIRCUIT_STATE.OPEN);
    assert.equal(breaker.isAvailable(), false);

    // Deprecation immediately trips
    const depBreaker = policy.getCircuitBreaker("dep-prov", "dep-model");
    depBreaker.recordFailure(FAILURE_TYPE.DEPRECATION);
    assert.equal(depBreaker.state, CIRCUIT_STATE.OPEN);

    // Failure classification
    assert.equal(policy.classifyFailure(new Error("This version of Antigravity is no longer supported")), FAILURE_TYPE.DEPRECATION);
    assert.equal(policy.classifyFailure(null, "unauthorized", 401), FAILURE_TYPE.AUTH_FATAL);
    assert.equal(policy.classifyFailure(null, "rate limit exceeded", 429), FAILURE_TYPE.TRANSIENT);
    assert.equal(policy.classifyFailure(null, "maximum context length exceeded"), FAILURE_TYPE.INCAPABLE);
  });

  test.it("FallbackEngine - should detect upstream deprecation patterns", () => {
    const engine = new FallbackEngine();

    assert.equal(engine.isDeprecationResponse("This version of Antigravity is no longer supported. Please upgrade Antigravity."), true);
    assert.equal(engine.isDeprecationResponse("Unsupported client version detected"), true);
    assert.equal(engine.isDeprecationResponse("Valid completion response with code"), false);
    assert.equal(engine.isDeprecationResponse(null), false);
  });

  test.it("AgentClientManager - should accurately detect client types and adapt payloads", () => {
    const manager = new AgentClientManager();

    const superdesignType = manager.detectClient({ "user-agent": "superdesign/0.6.0" });
    assert.equal(superdesignType, CLIENT_TYPES.SUPERDESIGN);

    const claudeCliType = manager.detectClient({ "user-agent": "@anthropic-ai/claude-code/1.0.0" });
    assert.equal(claudeCliType, CLIENT_TYPES.CLAUDE_CODE_CLI);

    const cursorType = manager.detectClient({ "user-agent": "Cursor/0.45.0" });
    assert.equal(cursorType, CLIENT_TYPES.CURSOR);

    // Format payload for Anthropic client
    const anthropicPayload = manager.formatPayloadForClient({
      messages: [{ role: "system", content: "System instructions" }, { role: "user", content: "Hi" }]
    }, CLIENT_TYPES.CLAUDE_CODE_CLI);
    assert.equal(anthropicPayload.system, "System instructions");
    assert.equal(anthropicPayload.messages.length, 1);
  });

  test.it("ConfigManager - should manage snapshots and scoped process environments", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "limitless-test-"));
    const configManager = new ConfigManager({
      homeDir: tmpDir,
      projectRoot: tmpDir
    });

    assert.equal(configManager.getActiveProfile(), PROFILES.LIMITLESS);

    configManager.setActiveProfile(PROFILES.OPENCODE_GO);
    assert.equal(configManager.getActiveProfile(), PROFILES.OPENCODE_GO);

    // Scoped environment test
    const scopedLimitless = configManager.getScopedEnv(PROFILES.LIMITLESS);
    assert.equal(scopedLimitless.ANTHROPIC_BASE_URL, "http://127.0.0.1:20128");

    const scopedNative = configManager.getScopedEnv(PROFILES.NATIVE);
    assert.equal(scopedNative.ANTHROPIC_BASE_URL, undefined);

    // Snapshot creation and listing
    const snapId = configManager.createSnapshot("test-snap");
    assert.ok(snapId.startsWith("test-snap-"));

    const snapshots = configManager.listSnapshots();
    assert.equal(snapshots.length, 1);

    // Rollback
    const restored = configManager.rollback(snapId);
    assert.ok(restored >= 1);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test.it("BenchmarkEngine - should evaluate task token matching accurately", () => {
    const engine = new BenchmarkEngine();
    const task = BENCHMARK_TASKS[0]; // Atomic Syntax Patch: expects "return a + b;"

    const passResult = engine.evaluateOutput(task, "function sum(a, b) {\n  return a + b;\n}");
    assert.equal(passResult.passed, true);
    assert.equal(passResult.score, 100);

    const failResult = engine.evaluateOutput(task, "function sum(a, b) { broken code }");
    assert.equal(failResult.passed, false);
    assert.equal(failResult.score, 0);
  });

  test.it("Provider Profiles Registry - should export all 6 profiles with valid verify handlers", () => {
    const profiles = listProfiles();
    assert.equal(profiles.length, 6);

    const native = getProfile("native");
    assert.equal(native.id, "native");
    assert.equal(native.targetBaseUrl, "https://api.anthropic.com");

    const limitless = getProfile("limitless");
    assert.equal(limitless.id, "limitless");
    assert.equal(limitless.targetBaseUrl, "http://127.0.0.1:20128");

    const opencodeGo = getProfile("opencode-go");
    assert.equal(opencodeGo.id, "opencode-go");
    assert.equal(opencodeGo.billingType, BILLING_CLASSES.SUBSCRIPTION_ENTITLED);

    const opencodeZen = getProfile("opencode-zen");
    assert.equal(opencodeZen.id, "opencode-zen");
    assert.equal(opencodeZen.billingType, BILLING_CLASSES.PAY_AS_YOU_GO);

    const openrouter = getProfile("openrouter");
    assert.equal(openrouter.id, "openrouter");

    const antigravity = getProfile("antigravity");
    assert.equal(antigravity.id, "antigravity");
  });

  test.it("TelemetryEngine - should safely handle null or empty database", () => {
    const telemetry = new TelemetryEngine();
    const metrics = telemetry.getMetrics(null);
    assert.equal(metrics.totalCalls, 0);
    assert.equal(metrics.successRate, 0);
    assert.equal(metrics.estimatedCostUsd, 0);
  });

});
