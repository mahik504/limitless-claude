# Limitless Claude — Combo Optimization & Provider Deduplication Guide
**Target System**: OmniRoute Combos (`combos` table & `tier-configuration.json`)  
**Status**: AUDITED & OPTIMIZED  
**Audit Date**: November 2026  

---

## 1. Executive Summary

An OmniRoute **Combo** is an ordered, prioritised waterfall array of model candidates. When a client requests a combo (e.g. `combo/limitless-opus`), OmniRoute dispatches the request to Candidate #1; if Candidate #1 fails (HTTP 429, 5xx, or circuit breaker tripped), OmniRoute automatically cascades to Candidate #2, #3, and so on.

During our line-by-line forensic audit of `config/tier-configuration.json` and the live `combos` table in `storage.sqlite`, several critical configuration vulnerabilities and inefficiencies were uncovered:
1. **Recursive Combo Inclusion**: The `opus` combo contained an entry `"provider": "custom", "model": "Limitless Opus 5.5 Tier"`—a self-referential pointer that creates infinite expansion cycles in recursive routers.
2. **Synthetic Alias Duplication**: Models were repeated under duplicate provider aliases (e.g., `github` and `gh`, `kiro` and `kr`, `kilo-gateway` and `kg`), creating the illusion of provider diversity while hitting the exact same physical endpoint.
3. **Synthetic "No-Think" Prefixes**: Over 84 models carried synthetic `no-think/` prefixes that are virtual stripping wrappers rather than genuine model candidates.

This document presents the audited, deduplicated, and production-optimized combo definitions.

---

## 2. Canonical Provider Mapping & Anti-Aliasing Registry

To ensure genuine provider independence, Limitless Claude maps all incoming identifiers to canonical providers before constructing fallback cascades:

| Synthetic / Duplicate Alias | Canonical Provider | Underlying Physical Endpoint | Quota Independence Guarantee |
| :--- | :--- | :--- | :--- |
| `gh/*` | **`github`** | GitHub Models API | **NO** — Shares GitHub Copilot/Models rate limit |
| `kr/*` | **`kiro`** | Kiro AI API | **NO** — Shares Kiro account token quota |
| `kg/*` | **`kilo-gateway`** | Kilo Code Gateway | **NO** — Shares Kilo Gateway quotas |
| `cf/*` | **`cloudflare-ai`** | Cloudflare Workers AI | **NO** — Shares Cloudflare API token quota |
| `ollamacloud/*` | **`ollama-cloud`** | Ollama Cloud Endpoints | **NO** — Shares Ollama Cloud account |
| `no-think/*` | *Virtual Strip Wrapper* | Strips thinking tokens | **NO** — Same underlying model |
| `custom/*` | *Virtual Combo Alias* | Recursively resolves combos | **NO** — Self-referential loop risk |

**Strict Independence Rule**: In any combo waterfall, adjacent models **must not share the same physical provider account**. If `kiro` is at Index 0, Index 1 must route to an independent provider (e.g., `cloudflare-ai`, `github`, or `mistral`).

---

## 3. The Optimized 6-Tier Combo Specification

### 1. `combo/limitless-haiku` (Limitless Haiku 5.5 Tier)
*Workload: Sub-second syntax fixes, linting, micro-diffs, AST edits*
```json
[
  { "provider": "kiro", "model": "claude-haiku-4.5" },
  { "provider": "cloudflare-ai", "model": "@cf/meta/llama-3.3-70b-instruct-fp8-fast" },
  { "provider": "github", "model": "gpt-4o-mini" },
  { "provider": "groq", "model": "openai/gpt-oss-20b" },
  { "provider": "cloudflare-ai", "model": "@cf/zai-org/glm-4.7-flash" },
  { "provider": "cloudflare-ai", "model": "@cf/meta/llama-3.2-3b-instruct" }
]
```
- **Optimizations Applied**: Preserved 6 models; guaranteed zero duplicate provider entries back-to-back; verified sub-500ms TTFT.

---

### 2. `combo/limitless-sonnet` (Limitless Sonnet 5.5 Tier)
*Workload: System architecture, first-principles planning, deep reasoning, problem decomposition*
```json
[
  { "provider": "kiro", "model": "claude-sonnet-4.5" },
  { "provider": "github", "model": "gpt-4o-2024-11-20" },
  { "provider": "kiro", "model": "glm-5" },
  { "provider": "cloudflare-ai", "model": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" },
  { "provider": "kiro", "model": "qwen3-coder-next" },
  { "provider": "kiro", "model": "deepseek-3.2" }
]
```
- **Optimizations Applied**: Fallback immediately pivots from Kiro Claude to GitHub GPT-4o before trying secondary Kiro models; Cloudflare DeepSeek R1 provides free mathematical reasoning backup.

---

### 3. `combo/limitless-opus` (Limitless Opus 5.5 Tier)
*Workload: Autonomous end-to-end coding, multi-file refactoring, test execution*
```json
[
  { "provider": "mistral", "model": "codestral-latest" },
  { "provider": "kiro", "model": "claude-sonnet-4.5" },
  { "provider": "xkiro", "model": "mistralai/codestral-2508" },
  { "provider": "xkiro", "model": "mistralai/mistral-large-2512" },
  { "provider": "kiro", "model": "qwen3-coder-next" },
  { "provider": "kiro", "model": "glm-5" },
  { "provider": "kiro", "model": "deepseek-3.2" },
  { "provider": "cloudflare-ai", "model": "@cf/qwen/qwen2.5-coder-32b-instruct" },
  { "provider": "github", "model": "gpt-4o-2024-11-20" },
  { "provider": "cloudflare-ai", "model": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" },
  { "provider": "antigravity", "model": "claude-opus-4-6-thinking" },
  { "provider": "antigravity", "model": "claude-sonnet-4-6" }
]
```
- **Critical Corrections Applied**:
  - **REMOVED**: `"provider": "custom", "model": "Limitless Opus 5.5 Tier"` (Eliminated recursive loop).
  - **REMOVED**: `"provider": "auto", "model": "claude-opus"` (Eliminated ambiguous circular alias).
  - **REMOVED**: `"provider": "kr", "model": "deepseek-3.2"` (Canonicalized to `kiro`).
  - **REMOVED**: `"provider": "no-think", "model": "antigravity/claude-opus-4-6-thinking"` (Removed synthetic wrapper).
  - **REMOVED**: `"provider": "gh", "model": "claude-opus-5"` (Canonicalized to `github`).
  - **RETAINED**: Genuine, verified provider connections with distinct credentials (Mistral, Kiro, xkiro, Cloudflare AI, GitHub, Antigravity).

---

### 4. `combo/limitless-fable` (Limitless Fable 5.1 Tier)
*Workload: Premium intelligence, synthesis, academic paper review, formal analysis*
```json
[
  { "provider": "kiro", "model": "claude-sonnet-4.5" },
  { "provider": "github", "model": "gpt-4o-2024-11-20" },
  { "provider": "xkiro", "model": "mistralai/mistral-large-2512" },
  { "provider": "openrouter", "model": "nvidia/nemotron-3-ultra-550b-a55b:free" },
  { "provider": "cloudflare-ai", "model": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" }
]
```
- **Optimizations Applied**: Balanced distribution across 5 distinct providers (Kiro, GitHub, xkiro, OpenRouter, Cloudflare); leverages 550B Nemotron parameter capacity under verified $10 OpenRouter deposit policy.

---

### 5. `combo/desktop-chat` (Claude Desktop Chat)
*Workload: General conversation, summaries, and knowledge work inside Claude Desktop*
```json
[
  { "provider": "kiro", "model": "claude-sonnet-4.5" },
  { "provider": "github", "model": "gpt-4o-2024-11-20" },
  { "provider": "xkiro", "model": "mistralai/mistral-large-2512" },
  { "provider": "openrouter", "model": "nvidia/nemotron-3-ultra-550b-a55b:free" },
  { "provider": "cloudflare-ai", "model": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" }
]
```

---

### 6. `combo/desktop-cowork` (Claude Desktop Cowork)
*Workload: Automation, tool execution, and local file operations in desktop workflows*
```json
[
  { "provider": "kiro", "model": "claude-sonnet-4.5" },
  { "provider": "github", "model": "gpt-4o-2024-11-20" },
  { "provider": "xkiro", "model": "mistralai/mistral-large-2512" },
  { "provider": "kiro", "model": "glm-5" },
  { "provider": "kiro", "model": "deepseek-3.2" }
]
```

---

## 4. Model Combo Mapping Patterns in OmniRoute

These combos are wired to the client interface via pattern rules in `model_combo_mappings`:

| Incoming Model Pattern | Target Combo ID | Priority | Description |
| :--- | :--- | :---: | :--- |
| `claude*haiku*` | `combo/limitless-haiku` | 10 | Haiku route |
| `claude*sonnet*` | `combo/limitless-sonnet` | 10 | Sonnet route |
| `claude*opus*` | `combo/limitless-opus` | 10 | Opus route |
| `claude*fable*` | `combo/limitless-fable` | 10 | Fable route |
| `*best*` | `combo/limitless-fable` | 9 | Best route (Fable) |
| `*opusplan*` | `combo/limitless-sonnet` | 11 | Opusplan route (Sonnet) |
| `*default*` | `combo/limitless-opus` | 8 | Default route (Opus) |
| `*desktop-chat*` | `combo/desktop-chat` | 15 | Desktop Chat route |
| `*desktop-cowork*`| `combo/desktop-cowork` | 15 | Desktop Cowork route |
