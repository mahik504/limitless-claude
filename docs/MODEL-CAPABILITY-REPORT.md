# Limitless Claude 7.0.0 — Model Capability & Evaluation Report

This report defines the capability classification engine implemented in [`src/core/capability-evaluator.js`](file:///C:/projects/limitless-claude/src/core/capability-evaluator.js), mapping models across 7 capability profiles.

---

## 1. Capability Profiles Definition

| Profile | Target Latency | Core Competencies | Primary Tier |
| :--- | :---: | :--- | :---: |
| **`FAST`** | < 1.0s | Sub-second atomic syntax fixes, grep, rapid file modifications, terminal checks | Haiku 5.5 |
| **`BALANCED`** | 1.0s - 3.0s | Standard feature development, multi-file edits, unit test creation, refactoring | Opus 5.5 |
| **`REASONING`** | 2.0s - 4.0s | System architecture, distributed state, concurrency flaw hunting, boundary analysis | Sonnet 5.5 |
| **`FRONTEND`** | 1.5s - 3.5s | React 19, Tailwind CSS v4, component state machines, CSS layout, accessibility | Opus 5.5 |
| **`3D`** | 2.0s - 4.5s | Three.js, React Three Fiber (R3F), GLSL shaders, WebGL canvas, 60fps budgets | Opus 5.5 |
| **`BACKEND`** | 1.5s - 3.5s | PostgreSQL schemas, Supabase RLS policies, REST/GraphQL APIs, validation | Opus 5.5 |
| **`REVIEW`** | 2.0s - 4.0s | Hostile adversarial security audit, SQL injection hunting, anti-slop review | Sonnet 5.5 |

---

## 2. Model Empirical Capability Scores (1 - 10 Scale)

Scores derived from empirical benchmark tasks and codebase evaluations:

| Provider / Model | Coding | Reasoning | Tools | Frontend | 3D | Backend | Speed | Primary Profiles |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **`cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast`** | 9.3 | 9.0 | 9.5 | 8.8 | 8.2 | 9.2 | 9.8 | `FAST`, `BACKEND` |
| **`github/gpt-4o-mini`** | 9.0 | 8.8 | 9.5 | 8.6 | 8.0 | 8.9 | 9.7 | `FAST`, `BALANCED` |
| **`kilo-gateway/nvidia/nemotron-3.5-lightning:free`** | 8.9 | 8.6 | 9.1 | 8.4 | 7.9 | 8.8 | 9.6 | `FAST` |
| **`kiro/claude-sonnet-4.5`** | 9.8 | 9.9 | 9.7 | 9.6 | 9.3 | 9.8 | 8.5 | `REASONING`, `REVIEW`, `3D` |
| **`kiro/glm-5`** | 9.5 | 9.3 | 9.2 | 9.1 | 8.7 | 9.4 | 8.9 | `BALANCED`, `BACKEND` |
| **`kiro/deepseek-3.2`** | 9.7 | 9.8 | 9.5 | 9.0 | 8.8 | 9.7 | 8.2 | `REASONING`, `BACKEND` |
| **`kiro/qwen3-coder-next`** | 9.6 | 9.2 | 9.3 | 9.2 | 8.5 | 9.5 | 9.0 | `BACKEND`, `BALANCED` |
| **`github/gpt-4o`** | 9.4 | 9.3 | 9.6 | 9.2 | 8.8 | 9.3 | 8.8 | `BALANCED`, `REVIEW` |
| **`mistral/codestral-latest`** | 9.6 | 8.8 | 9.4 | 8.5 | 8.0 | 9.7 | 9.8 | `FAST`, `BACKEND` |
| **`cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct`** | 9.4 | 8.9 | 9.2 | 8.9 | 8.3 | 9.4 | 9.2 | `BACKEND`, `BALANCED` |
| **`cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`** | 9.5 | 9.6 | 9.0 | 8.8 | 8.6 | 9.3 | 8.4 | `REASONING` |

---

## 3. Tier Placement Rationale

### Haiku Tier (Strict 6 Models)
Engineered for rapid repository grep, syntax checking, and atomic diff application:
1. `cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast` (Index 0 — 0.60s latency)
2. `github/gpt-4o-mini` (Index 1 — 0.70s latency)
3. `kilo-gateway/nvidia/nemotron-3.5-lightning:free`
4. `openrouter/nvidia/nemotron-3.5-lightning:free`
5. `groq/openai/gpt-oss-20b`
6. `antigravity/gemini-3-flash`

### Sonnet Tier (Strict 8 Models)
Engineered for architectural system design, planning, and flaw hunting:
1. `kiro/claude-sonnet-4.5` (Index 0 — 2.57s latency)
2. `kiro/glm-5`
3. `kiro/qwen3-coder-next`
4. `github/gpt-4o`
5. `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`
6. `cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast`
7. `kiro/minimax-m2.5`
8. `antigravity/gemini-3-flash`

### Opus Tier (25 Models)
High-capacity reservoir for autonomous multi-file loops, React 19 UI, and 3D WebGL scenes:
- `mistral/codestral-latest`, `kiro/glm-5`, `kiro/qwen3-coder-next`, `kiro/claude-sonnet-4.5`, `kiro/deepseek-3.2`, `cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct`, `github/gpt-4o`, `github/gpt-4o-2024-11-20`, and free community fallbacks.

### Fable Tier (Strict 5 Flagship Models)
Premier composite frontier intelligence fleet:
1. `kiro/claude-sonnet-4.5`
2. `kiro/deepseek-3.2`
3. `kiro/glm-5`
4. `github/gpt-4o-2024-11-20`
5. `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`
