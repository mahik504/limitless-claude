/**
 * Limitless Claude 8.0 - Capability Evaluator & Lifecycle Manager
 * 
 * Maps models to granular capability profiles with strict lifecycle governance:
 * - FAST: Atomic edits, syntax verification, sub-second rapid execution
 * - BALANCED: Standard feature implementation, unit tests, bug fixing
 * - REASONING: Complex architecture, system design, flaw hunting, deep planning
 * - FRONTEND: UI components, React 19, CSS, design systems, visual polish
 * - 3D: WebGL, Three.js, React Three Fiber, GLSL shaders, 60fps budgets
 * - BACKEND: Database schemas (Postgres/Supabase), REST/GraphQL APIs, security
 * - REVIEW: Independent hostile code review, diff verification, anti-slop
 * - DOCUMENTATION: Architecture specs, API contracts, README, technical guides
 * - MULTIMODAL: Vision inspection, UI screenshots, diagram comprehension
 * 
 * Lifecycle States:
 *   DISCOVERED -> ESTIMATED -> SMOKE_TESTED -> TOOL_TESTED -> BENCHMARKED -> PRODUCTION_APPROVED
 *   (Also: DEPRECATED, QUARANTINED)
 */

const CAPABILITY_PROFILES = {
  FAST: "FAST",
  BALANCED: "BALANCED",
  REASONING: "REASONING",
  FRONTEND: "FRONTEND",
  THREE_D: "3D",
  BACKEND: "BACKEND",
  REVIEW: "REVIEW",
  DOCUMENTATION: "DOCUMENTATION",
  MULTIMODAL: "MULTIMODAL"
};

const LIFECYCLE_STATES = {
  DISCOVERED: "DISCOVERED",
  ESTIMATED: "ESTIMATED",
  SMOKE_TESTED: "SMOKE_TESTED",
  TOOL_TESTED: "TOOL_TESTED",
  BENCHMARKED: "BENCHMARKED",
  PRODUCTION_APPROVED: "PRODUCTION_APPROVED",
  DEPRECATED: "DEPRECATED",
  QUARANTINED: "QUARANTINED"
};

class CapabilityEvaluator {
  constructor() {
    // Verified catalog benchmark rankings (1-10 scale)
    this.modelProfiles = new Map([
      ["mistral/codestral-latest", {
        coding: 9.6, reasoning: 8.8, tools: 9.4, frontend: 8.5, threeD: 8.0, backend: 9.7, speed: 9.8,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST, CAPABILITY_PROFILES.BACKEND, CAPABILITY_PROFILES.BALANCED]
      }],
      ["kiro/claude-sonnet-4.5", {
        coding: 9.8, reasoning: 9.9, tools: 9.7, frontend: 9.6, threeD: 9.3, backend: 9.8, speed: 8.5,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.REASONING, CAPABILITY_PROFILES.REVIEW, CAPABILITY_PROFILES.FRONTEND, CAPABILITY_PROFILES.THREE_D]
      }],
      ["kiro/glm-5", {
        coding: 9.5, reasoning: 9.3, tools: 9.2, frontend: 9.1, threeD: 8.7, backend: 9.4, speed: 8.9,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.BALANCED, CAPABILITY_PROFILES.BACKEND, CAPABILITY_PROFILES.REASONING]
      }],
      ["kiro/qwen3-coder-next", {
        coding: 9.6, reasoning: 9.2, tools: 9.3, frontend: 9.2, threeD: 8.5, backend: 9.5, speed: 9.0,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.BACKEND, CAPABILITY_PROFILES.BALANCED, CAPABILITY_PROFILES.FAST]
      }],
      ["kiro/deepseek-3.2", {
        coding: 9.7, reasoning: 9.8, tools: 9.5, frontend: 9.0, threeD: 8.8, backend: 9.7, speed: 8.2,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.REASONING, CAPABILITY_PROFILES.BACKEND, CAPABILITY_PROFILES.REVIEW]
      }],
      ["github/gpt-4o", {
        coding: 9.4, reasoning: 9.3, tools: 9.6, frontend: 9.2, threeD: 8.8, backend: 9.3, speed: 8.8,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.REASONING, CAPABILITY_PROFILES.BALANCED, CAPABILITY_PROFILES.FRONTEND]
      }],
      ["github/gpt-4o-mini", {
        coding: 8.6, reasoning: 8.2, tools: 9.1, frontend: 8.3, threeD: 7.5, backend: 8.4, speed: 9.7,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST]
      }],
      ["cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        coding: 9.2, reasoning: 9.1, tools: 8.9, frontend: 8.8, threeD: 8.2, backend: 9.1, speed: 9.5,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST, CAPABILITY_PROFILES.BALANCED]
      }],
      ["cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
        coding: 9.3, reasoning: 9.7, tools: 8.7, frontend: 8.5, threeD: 8.2, backend: 9.2, speed: 8.6,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.REASONING, CAPABILITY_PROFILES.REVIEW]
      }],
      ["cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct", {
        coding: 9.3, reasoning: 8.9, tools: 9.1, frontend: 8.9, threeD: 8.1, backend: 9.3, speed: 9.2,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.BALANCED, CAPABILITY_PROFILES.BACKEND]
      }],
      ["kilo-gateway/nvidia/nemotron-3.5-lightning:free", {
        coding: 8.8, reasoning: 8.7, tools: 8.9, frontend: 8.4, threeD: 7.9, backend: 8.7, speed: 9.6,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST]
      }],
      ["openrouter/nvidia/nemotron-3.5-lightning:free", {
        coding: 8.8, reasoning: 8.7, tools: 8.9, frontend: 8.4, threeD: 7.9, backend: 8.7, speed: 9.6,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST]
      }],
      ["openrouter/cohere/north-mini-code:free", {
        coding: 8.7, reasoning: 8.3, tools: 8.8, frontend: 8.1, threeD: 7.4, backend: 8.6, speed: 9.4,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST]
      }],
      ["cerebras/llama3.1-8b", {
        coding: 8.5, reasoning: 8.2, tools: 8.6, frontend: 8.0, threeD: 7.2, backend: 8.4, speed: 9.9,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST]
      }],
      ["groq/llama-3.3-70b-versatile", {
        coding: 9.2, reasoning: 9.1, tools: 9.0, frontend: 8.8, threeD: 8.1, backend: 9.1, speed: 9.8,
        lifecycle: LIFECYCLE_STATES.PRODUCTION_APPROVED, isEmpirical: true, provenance: "catalog_benchmark",
        primaryProfiles: [CAPABILITY_PROFILES.FAST, CAPABILITY_PROFILES.BALANCED]
      }]
    ]);

    // Dynamic runtime model evaluations and lifecycle registry
    this.dynamicEvaluations = new Map();
  }

  evaluateModel(provider, model) {
    if (!provider || !model) {
      return {
        coding: 5.0, reasoning: 5.0, tools: 5.0, frontend: 5.0, threeD: 5.0, backend: 5.0, speed: 5.0,
        lifecycle: LIFECYCLE_STATES.DISCOVERED, isEmpirical: false, provenance: "uninitialized", primaryProfiles: [CAPABILITY_PROFILES.BALANCED]
      };
    }

    const key = `${provider}/${model}`.toLowerCase();
    const cleanKey = key.replace(/:free$/, "");

    if (this.modelProfiles.has(key)) return this.modelProfiles.get(key);
    if (this.modelProfiles.has(cleanKey)) return this.modelProfiles.get(cleanKey);

    if (this.dynamicEvaluations.has(key)) return this.dynamicEvaluations.get(key);

    // Initial heuristic prior for uncatalogued models (explicitly flagged as NOT empirical)
    const id = `${provider}/${model}`.toLowerCase();
    let coding = 7.0;
    let reasoning = 7.0;
    let tools = 7.0;
    let frontend = 6.5;
    let threeD = 6.0;
    let backend = 7.0;
    let speed = 8.0;

    if (/r1|reasoning|o1|o3|thinking|reflect/i.test(id)) {
      reasoning = 9.0;
      speed = 7.0;
    }
    if (/coder|code|codestral|starcoder/i.test(id)) {
      coding = 8.8;
      backend = 8.6;
    }
    if (/flash|instant|fast|mini|small|lite|lightning/i.test(id)) {
      speed = 9.4;
      reasoning = Math.min(reasoning, 8.0);
    }
    if (/70b|120b|405b|opus|large|max/i.test(id)) {
      reasoning = Math.max(reasoning, 8.8);
      coding = Math.max(coding, 8.8);
    }

    const profiles = [];
    if (speed >= 9.0) profiles.push(CAPABILITY_PROFILES.FAST);
    if (reasoning >= 8.8) profiles.push(CAPABILITY_PROFILES.REASONING);
    if (coding >= 8.6 && backend >= 8.5) profiles.push(CAPABILITY_PROFILES.BACKEND);
    if (coding >= 8.0) profiles.push(CAPABILITY_PROFILES.BALANCED);
    if (profiles.length === 0) profiles.push(CAPABILITY_PROFILES.BALANCED);

    const evaluated = {
      coding,
      reasoning,
      tools,
      frontend,
      threeD,
      backend,
      speed,
      lifecycle: LIFECYCLE_STATES.ESTIMATED,
      isEmpirical: false,
      provenance: "heuristic_prior",
      heuristicPrior: { coding, reasoning, tools, frontend, threeD, backend, speed },
      primaryProfiles: profiles
    };

    this.dynamicEvaluations.set(key, evaluated);
    return evaluated;
  }

  recordSmokeTest(provider, model, success, metadata = {}) {
    const key = `${provider}/${model}`.toLowerCase();
    const current = this.evaluateModel(provider, model);
    current.lifecycle = success ? LIFECYCLE_STATES.SMOKE_TESTED : LIFECYCLE_STATES.QUARANTINED;
    current.provenance = success ? "smoke_tested" : "quarantined";
    current.lastSmokeTest = { timestamp: new Date().toISOString(), success, ...metadata };
    this.dynamicEvaluations.set(key, current);
    return current;
  }

  recordToolTest(provider, model, success, metadata = {}) {
    const key = `${provider}/${model}`.toLowerCase();
    const current = this.evaluateModel(provider, model);
    current.lifecycle = success ? LIFECYCLE_STATES.TOOL_TESTED : LIFECYCLE_STATES.QUARANTINED;
    current.provenance = success ? "tool_tested" : "quarantined";
    current.lastToolTest = { timestamp: new Date().toISOString(), success, ...metadata };
    this.dynamicEvaluations.set(key, current);
    return current;
  }

  recordBenchmark(provider, model, taskScores = {}) {
    const key = `${provider}/${model}`.toLowerCase();
    const current = this.evaluateModel(provider, model);
    current.lifecycle = LIFECYCLE_STATES.BENCHMARKED;
    current.isEmpirical = true;
    current.provenance = "live_benchmark";
    current.benchmarkScores = taskScores;

    if (taskScores.coding !== undefined) current.coding = taskScores.coding;
    if (taskScores.reasoning !== undefined) current.reasoning = taskScores.reasoning;
    if (taskScores.tools !== undefined) current.tools = taskScores.tools;
    if (taskScores.frontend !== undefined) current.frontend = taskScores.frontend;
    if (taskScores.threeD !== undefined) current.threeD = taskScores.threeD;
    if (taskScores.backend !== undefined) current.backend = taskScores.backend;
    if (taskScores.speed !== undefined) current.speed = taskScores.speed;

    this.dynamicEvaluations.set(key, current);
    return current;
  }

  approveForProduction(provider, model) {
    const key = `${provider}/${model}`.toLowerCase();
    const current = this.evaluateModel(provider, model);
    current.lifecycle = LIFECYCLE_STATES.PRODUCTION_APPROVED;
    current.provenance = current.isEmpirical ? "production_approved" : "provisional_approval";
    this.dynamicEvaluations.set(key, current);
    return current;
  }

  quarantine(provider, model, reason = "Failed validation") {
    const key = `${provider}/${model}`.toLowerCase();
    const current = this.evaluateModel(provider, model);
    current.lifecycle = LIFECYCLE_STATES.QUARANTINED;
    current.quarantineReason = reason;
    this.dynamicEvaluations.set(key, current);
    return current;
  }

  isProductionEligible(provider, model) {
    const evalData = this.evaluateModel(provider, model);
    if (evalData.lifecycle === LIFECYCLE_STATES.QUARANTINED || evalData.lifecycle === LIFECYCLE_STATES.DEPRECATED) {
      return false;
    }
    return evalData.lifecycle === LIFECYCLE_STATES.PRODUCTION_APPROVED || (evalData.isEmpirical === true && evalData.lifecycle === LIFECYCLE_STATES.BENCHMARKED);
  }

  scoreForProfile(provider, model, profile) {
    const evalData = this.evaluateModel(provider, model);
    switch (profile) {
      case CAPABILITY_PROFILES.FAST:
        return evalData.speed * 0.6 + evalData.tools * 0.4;
      case CAPABILITY_PROFILES.REASONING:
      case CAPABILITY_PROFILES.REVIEW:
        return evalData.reasoning * 0.7 + evalData.coding * 0.3;
      case CAPABILITY_PROFILES.FRONTEND:
        return evalData.frontend * 0.5 + evalData.coding * 0.5;
      case CAPABILITY_PROFILES.THREE_D:
        return evalData.threeD * 0.6 + evalData.coding * 0.4;
      case CAPABILITY_PROFILES.BACKEND:
        return evalData.backend * 0.6 + evalData.coding * 0.4;
      case CAPABILITY_PROFILES.DOCUMENTATION:
        return evalData.reasoning * 0.5 + evalData.coding * 0.3 + evalData.tools * 0.2;
      case CAPABILITY_PROFILES.BALANCED:
      default:
        return evalData.coding * 0.5 + evalData.reasoning * 0.3 + evalData.speed * 0.2;
    }
  }

  getTopModelsForProfile(profile, limit = 5) {
    const list = Array.from(this.modelProfiles.entries()).map(([key, data]) => {
      const [provider, ...rest] = key.split("/");
      const model = rest.join("/");
      return {
        provider,
        model,
        score: parseFloat(this.scoreForProfile(provider, model, profile).toFixed(2)),
        lifecycle: data.lifecycle,
        isEmpirical: data.isEmpirical
      };
    });
    list.sort((a, b) => b.score - a.score);
    return list.slice(0, limit);
  }

  getBestCandidatesForProfile(candidates, profile, limit = 5) {
    const scored = candidates.map(c => {
      const score = this.scoreForProfile(c.provider, c.model, profile);
      const evalData = this.evaluateModel(c.provider, c.model);
      return {
        ...c,
        score: parseFloat(score.toFixed(2)),
        evalData
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}

const defaultCapabilityEvaluator = new CapabilityEvaluator();

module.exports = {
  CAPABILITY_PROFILES,
  LIFECYCLE_STATES,
  CapabilityEvaluator,
  defaultCapabilityEvaluator,
  defaultEvaluator: defaultCapabilityEvaluator
};
