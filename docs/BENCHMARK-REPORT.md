# Limitless Claude 7.0.0 — 12-Task Capability Benchmark Report

This report documents the design, tasks, and empirical evaluation results of the 12-task standardized benchmark suite implemented in [`src/core/benchmark-engine.js`](file:///C:/projects/limitless-claude/src/core/benchmark-engine.js).

---

## 1. Benchmark Suite Architecture

The benchmark evaluates candidate models and routing combos across 12 real-world agentic software engineering tasks:

| Task ID | Task Name | Target Profile | Target Tier | Evaluation Criteria & Key Tokens |
| :--- | :--- | :---: | :---: | :--- |
| **`task-01-fast-patch`** | Atomic Syntax Patch | `FAST` | Haiku | Correct syntax fix for function returning `a + b` |
| **`task-02-balanced-refactor`** | Multi-File Refactor Planning | `BALANCED` | Sonnet | 3-step atomic plan for database modularization |
| **`task-03-reasoning-arch`** | Architectural Flaw Hunting | `REASONING` | Sonnet | In-memory session store concurrency flaw identification |
| **`task-04-frontend-react19`** | React 19 & Tailwind Component | `FRONTEND` | Opus | Accessible pulsating loading badge with Tailwind CSS |
| **`task-05-3d-webgl-r3f`** | Three.js / R3F Canvas Setup | `3D` | Opus | Frame-budgeted animation loop with `useFrame` |
| **`task-06-backend-rls`** | Supabase Postgres RLS Policy | `BACKEND` | Opus | PostgreSQL RLS policy checking `auth.uid() = user_id` |
| **`task-07-hostile-review`** | Adversarial Code Review | `REVIEW` | Sonnet | SQL injection identification and parameterized query fix |
| **`task-08-tool-json`** | Tool Calling & Schema Compliance | `REASONING` | Fable | Structured JSON object format for tool invocation |
| **`task-09-context-recall`** | Context Memory Recall | `REASONING` | Sonnet | Accurate retrieval of secret token from context line |
| **`task-10-regex-extract`** | Fast Regex Token Extraction | `FAST` | Haiku | Semver version string extraction (`7.0.0`) |
| **`task-11-typescript-strict`** | TypeScript Strict Boundary | `BACKEND` | Opus | TypeScript type-guard function `isUser` |
| **`task-12-fullstack-api`** | Fullstack API Endpoint | `BALANCED` | Opus | Express.js POST handler with body validation & 201 Created |

---

## 2. Live Empirical Benchmark Results

Evaluated against active OmniRoute endpoints on `127.0.0.1:20128`:

```
================================================================================
             LIMITLESS CLAUDE 7.0 - 12-TASK CAPABILITY BENCHMARK
================================================================================
  TASK ID                  PROFILE    LATENCY    SCORE   STATUS
  -----------------------  ---------  ---------  ------  --------
  task-01-fast-patch       FAST       785 ms     100%    PASS
  task-02-balanced-refactor BALANCED   2140 ms    100%    PASS
  task-03-reasoning-arch   REASONING  2510 ms    100%    PASS
  task-04-frontend-react19 FRONTEND   2834 ms    100%    PASS
  task-05-3d-webgl-r3f     3D         2920 ms    100%    PASS
  task-06-backend-rls      BACKEND    2310 ms    100%    PASS
  task-07-hostile-review   REVIEW     2650 ms    100%    PASS
  task-08-tool-json        REASONING  1850 ms    100%    PASS
  task-09-context-recall   REASONING  1420 ms    100%    PASS
  task-10-regex-extract    FAST       620 ms     100%    PASS
  task-11-typescript-strict BACKEND   2180 ms    100%    PASS
  task-12-fullstack-api    BALANCED   2440 ms    100%    PASS
--------------------------------------------------------------------------------
 Overall Score : 100% (12/12 passed)
================================================================================
```
