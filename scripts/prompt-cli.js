#!/usr/bin/env node
/**
 * Limitless Claude 8.0 - Prompt Composition & Lab CLI
 * 
 * Inspect and test 5-layer prompt compositions:
 *   limitless prompt list
 *   limitless prompt compose [--capability <name>] [--provider <name>]
 *   limitless prompt test
 */

const { defaultPromptEngine } = require("../src/core/prompt-engine");
const { defaultPromptLab } = require("../src/core/prompt-lab");

const args = process.argv.slice(2);
const command = args[0] || "list";

if (command === "list") {
  console.log(`
================================================================================
              LIMITLESS CLAUDE 8.0 — PROMPT PROFILES & ADAPTERS
================================================================================

  LAYER 1: Universal Engineering Constitution
  - Core Invariants (anti-slop, understand before modifying, verification gate)

  LAYER 2: Task Capability Profiles
  - fast          : Atomic edits, syntax verification, sub-second latency
  - balanced      : Standard feature implementation, unit tests, bug fixing
  - reasoning     : Architectural decomposition, formal proofs, edge cases
  - frontend      : Modern React 19, CSS, design tokens, accessibility
  - 3d            : Three.js, R3F, GLSL shaders, 60fps budgets
  - backend       : ACID safety, PostgreSQL RLS, REST/GraphQL APIs
  - review        : Hostile code review, vulnerability detection, anti-slop
  - documentation : Grounded architecture documentation, API contracts

  LAYER 3: Upstream Provider Adapters
  - deepseek      : Preserves <think> reasoning blocks
  - kiro          : Structured XML blocks and Claude Sonnet conventions
  - mistral       : Codestral syntax with strict typing
  - qwen          : Qwen Code parameters and markdown conventions
  - generic       : Clean standard markdown

  LAYER 4: Project Context Adapter
  - Auto-discovers: AGENTS.md, CLAUDE.md, GEMINI.md, .cursorrules

  LAYER 5: Tool & Execution Contract
  - Strict parameter schemas, path safety, and diagnostic error recovery
================================================================================
`);
  process.exit(0);
}

if (command === "compose") {
  const capIdx = args.indexOf("--capability");
  const capability = capIdx !== -1 && args[capIdx + 1] ? args[capIdx + 1] : "balanced";

  const provIdx = args.indexOf("--provider");
  const provider = provIdx !== -1 && args[provIdx + 1] ? args[provIdx + 1] : "generic";

  const composed = defaultPromptEngine.composePrompt({
    capability,
    provider,
    projectDir: process.cwd()
  });

  console.log(`
================================================================================
            COMPOSED 5-LAYER PROMPT [${capability.toUpperCase()} / ${provider.toUpperCase()}]
================================================================================
  Hash: ${composed.hash}  |  Version: ${composed.version}
  Layers Active: ${Object.entries(composed.layers).filter(([_, v]) => v).map(([k]) => k).join(", ")}
--------------------------------------------------------------------------------
${composed.fullPrompt}
================================================================================
`);
  process.exit(0);
}

if (command === "test") {
  console.log(`
================================================================================
            LIMITLESS CLAUDE 8.0 — PROMPT LABORATORY FIXTURE TEST
================================================================================
`);
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

  const runResult = defaultPromptLab.evaluatePromptVariant("v8-cli-test", { capability: "balanced" }, mockExecutor);

  console.log(`  Prompt Hash     : ${runResult.promptHash}`);
  console.log(`  Fixtures Run    : ${runResult.fixturesRun}`);
  console.log(`  Fixtures Passed : ${runResult.fixturesPassed} / ${runResult.fixturesRun}`);
  console.log(`  Average Score   : ${runResult.avgScore}%`);
  console.log(`  Average Latency : ${runResult.avgLatency}ms`);
  console.log(`\n  Verdict         : ${runResult.fixturesPassed === runResult.fixturesRun ? "[PASS] ALL FIXTURES SATISFIED" : "[FAIL] REGRESSION DETECTED"}`);
  console.log("================================================================================");
  process.exit(0);
}
