/**
 * Limitless Claude 7.0 - 12-Task Capability Benchmark Suite
 * 
 * Evaluates candidates and combos across real-world agentic tasks:
 * 1. Atomic syntax patch (Fast)
 * 2. Multi-file refactor (Balanced)
 * 3. Architectural system design & flaw hunt (Reasoning)
 * 4. React 19 UI component with Tailwind v4 (Frontend)
 * 5. 3D WebGL / R3F Canvas shader setup (3D)
 * 6. Supabase / Postgres RLS schema migration (Backend)
 * 7. Hostile adversarial code review (Review)
 * 8. Tool calling & structured JSON schema (Frontier)
 * 9. Long context memory recall (Reasoning)
 * 10. Fast regex token extraction (Fast)
 * 11. TypeScript strict boundary enforcement (Backend)
 * 12. Fullstack API endpoint with validation (Balanced)
 */

const http = require("http");

const BENCHMARK_TASKS = [
  {
    id: "task-01-fast-patch",
    name: "Atomic Syntax Patch",
    profile: "FAST",
    tier: "haiku",
    prompt: "Fix the syntax error in: function sum(a, b) { retrun a + b; }. Return ONLY the corrected function.",
    expectedTokens: ["return a + b;"],
    weight: 1.0
  },
  {
    id: "task-02-balanced-refactor",
    name: "Multi-File Refactor Planning",
    profile: "BALANCED",
    tier: "sonnet",
    prompt: "Outline a 3-step atomic refactoring plan to split a monolithic database helper into connection, migration, and query files.",
    expectedTokens: ["step 1", "step 2", "step 3"],
    weight: 1.0
  },
  {
    id: "task-03-reasoning-arch",
    name: "Architectural Flaw Hunting",
    profile: "REASONING",
    tier: "sonnet",
    prompt: "Identify the critical flaw in an in-memory session store when horizontal autoscaling is enabled across multiple instances.",
    expectedTokens: ["session", "instance", "sticky", "redis", "shared"],
    weight: 1.2
  },
  {
    id: "task-04-frontend-react19",
    name: "React 19 & Tailwind Component",
    profile: "FRONTEND",
    tier: "opus",
    prompt: "Write a React 19 component with Tailwind CSS that displays an accessible loading badge with pulsating dot.",
    expectedTokens: ["export", "className", "animate-pulse"],
    weight: 1.2
  },
  {
    id: "task-05-3d-webgl-r3f",
    name: "Three.js / R3F Canvas Setup",
    profile: "3D",
    tier: "opus",
    prompt: "Explain how to structure a React Three Fiber canvas with a frame-budgeted animation loop using useFrame.",
    expectedTokens: ["Canvas", "useFrame", "clock", "delta"],
    weight: 1.2
  },
  {
    id: "task-06-backend-rls",
    name: "Supabase Postgres RLS Policy",
    profile: "BACKEND",
    tier: "opus",
    prompt: "Write a PostgreSQL RLS policy ensuring authenticated users can only update rows where auth.uid() = user_id.",
    expectedTokens: ["CREATE POLICY", "ON", "FOR UPDATE", "auth.uid()"],
    weight: 1.1
  },
  {
    id: "task-07-hostile-review",
    name: "Adversarial Code Review",
    profile: "REVIEW",
    tier: "sonnet",
    prompt: "Review this line for SQL injection: db.query(`SELECT * FROM users WHERE email = '${email}'`);. Explain the vulnerability and write the parameterized fix.",
    expectedTokens: ["injection", "parameter", "$1", "?"],
    weight: 1.2
  },
  {
    id: "task-08-tool-json",
    name: "Tool Calling & Schema Compliance",
    profile: "REASONING",
    tier: "fable",
    prompt: "Format a structured JSON object representing a tool call to 'fetch_weather' with location='Tokyo' and unit='celsius'. Return only JSON.",
    expectedTokens: ["fetch_weather", "location", "Tokyo"],
    weight: 1.3
  },
  {
    id: "task-09-context-recall",
    name: "Context Memory Recall",
    profile: "REASONING",
    tier: "sonnet",
    prompt: "A project has secret code ORCHESTRA_ALPHA_77 in line 1. What was the secret code?",
    expectedTokens: ["ORCHESTRA_ALPHA_77"],
    weight: 1.0
  },
  {
    id: "task-10-regex-extract",
    name: "Fast Regex Extraction",
    profile: "FAST",
    tier: "haiku",
    prompt: "Extract the semver from: 'release v7.0.0-rc1 available'. Return only the version string.",
    expectedTokens: ["7.0.0"],
    weight: 1.0
  },
  {
    id: "task-11-typescript-strict",
    name: "TypeScript Strict Boundary",
    profile: "BACKEND",
    tier: "opus",
    prompt: "Write a TypeScript type-guard function `isUser` verifying an unknown object has string property `id` and `name`.",
    expectedTokens: ["function isUser", "is User", "typeof", "undefined"],
    weight: 1.1
  },
  {
    id: "task-12-fullstack-api",
    name: "Fullstack API Endpoint",
    profile: "BALANCED",
    tier: "opus",
    prompt: "Draft an Express.js POST handler for /api/items validating body.name is non-empty and returning 201 Created or 400 Bad Request.",
    expectedTokens: ["app.post", "status(400)", "status(201)", "res.json"],
    weight: 1.2
  }
];

function normalizeTarget(target, taskTier = "sonnet") {
  if (!target || target === "auto" || target === "all") {
    if (taskTier === "haiku") return "claude-haiku-4-5";
    if (taskTier === "opus") return "claude-opus-4-8";
    if (taskTier === "fable") return "claude-fable-5-1";
    return "claude-sonnet-5";
  }
  const lower = target.toLowerCase();
  if (lower.includes("haiku")) return "claude-haiku-4-5";
  if (lower.includes("opus")) return "claude-opus-4-8";
  if (lower.includes("fable")) return "claude-fable-5-1";
  if (lower.includes("sonnet")) return "claude-sonnet-5";
  return target;
}

class BenchmarkEngine {
  constructor(options = {}) {
    this.gatewayHost = options.gatewayHost || "127.0.0.1";
    this.gatewayPort = options.gatewayPort || 20128;
    this.timeoutMs = options.timeoutMs || 25000;
  }

  evaluateOutput(task, outputText) {
    if (!task || !task.expectedTokens || !Array.isArray(task.expectedTokens)) {
      return { passed: false, score: 0, matchedTokens: [] };
    }
    if (!outputText || typeof outputText !== "string") {
      return { passed: false, score: 0, matchedTokens: [] };
    }

    const textLower = outputText.toLowerCase();
    const matched = task.expectedTokens.filter(t => textLower.includes(t.toLowerCase()));
    const ratio = task.expectedTokens.length > 0 ? (matched.length / task.expectedTokens.length) : 0;
    const score = Math.round(ratio * 100);

    return {
      passed: ratio >= 0.5,
      score,
      matchedTokens: matched
    };
  }

  async runTask(taskOrId, modelOrCombo, apiKey = null) {
    const task = typeof taskOrId === "string" 
      ? BENCHMARK_TASKS.find(t => t.id === taskOrId)
      : taskOrId;

    if (!task) {
      return {
        taskId: taskOrId,
        taskName: "Unknown Task",
        profile: "UNKNOWN",
        statusCode: 404,
        latencyMs: 0,
        passed: false,
        score: 0,
        error: `Task "${taskOrId}" not found in benchmark registry`,
        matchedTokens: [],
        outputSnippet: ""
      };
    }

    const resolvedModel = normalizeTarget(modelOrCombo, task.tier);
    const startTime = Date.now();
    return new Promise((resolve) => {
      const payload = JSON.stringify({
        model: resolvedModel,
        messages: [{ role: "user", content: task.prompt }],
        max_tokens: 350,
        temperature: 0.1
      });

      const headers = {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      };

      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["x-api-key"] = apiKey;
      }

      const req = http.request({
        hostname: this.gatewayHost,
        port: this.gatewayPort,
        path: "/v1/chat/completions",
        method: "POST",
        headers,
        timeout: this.timeoutMs
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          const latencyMs = Date.now() - startTime;
          let content = body;

          try {
            const parsed = JSON.parse(body);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
              const msg = parsed.choices[0].message;
              content = msg.content || msg.reasoning_content || msg.reasoning || "";
            } else if (Array.isArray(parsed.content)) {
              content = parsed.content.map(b => b.text || "").join("");
            }
          } catch (_) {}

          const evalResult = this.evaluateOutput(task, content);

          resolve({
            taskId: task.id,
            taskName: task.name,
            profile: task.profile,
            statusCode: res.statusCode,
            latencyMs,
            ...evalResult,
            outputSnippet: content.slice(0, 150)
          });
        });
      });

      req.on("error", (err) => {
        resolve({
          taskId: task.id,
          taskName: task.name,
          profile: task.profile,
          statusCode: 0,
          latencyMs: Date.now() - startTime,
          passed: false,
          score: 0,
          error: err.message
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          taskId: task.id,
          taskName: task.name,
          profile: task.profile,
          statusCode: 0,
          latencyMs: Date.now() - startTime,
          passed: false,
          score: 0,
          error: "Timeout"
        });
      });

      req.write(payload);
      req.end();
    });
  }

  async runSuite(targetModelOrCombo = "auto", apiKey = null) {
    const results = [];
    for (const task of BENCHMARK_TASKS) {
      const res = await this.runTask(task, targetModelOrCombo, apiKey);
      results.push(res);
    }

    const totalWeight = BENCHMARK_TASKS.reduce((acc, t) => acc + t.weight, 0);
    const weightedScore = BENCHMARK_TASKS.reduce((acc, t, idx) => {
      const score = results[idx]?.score || 0;
      return acc + (score * t.weight);
    }, 0);

    const overallScore = Math.round(weightedScore / totalWeight);
    const passedCount = results.filter(r => r.passed).length;

    return {
      target: targetModelOrCombo,
      timestamp: new Date().toISOString(),
      overallScore,
      passedCount,
      totalCount: BENCHMARK_TASKS.length,
      tasks: results
    };
  }
}

const defaultBenchmarkEngine = new BenchmarkEngine();

module.exports = {
  BENCHMARK_TASKS,
  BenchmarkEngine,
  defaultBenchmarkEngine
};
