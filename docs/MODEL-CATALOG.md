# Limitless Claude Model Catalog

This document details the candidate models configured in Limitless Claude's internal routing tiers.

> **Important Brand & Identity Disclaimer**:
> - The names **Haiku**, **Sonnet**, **Opus**, and **Fable** are **internal Limitless Claude routing-profile identifiers**. They do NOT imply that upstream models are official Anthropic Claude models.
> - In particular, **Fable is an internal composite routing tier**, not an official Anthropic product or model.
> - Limitless Claude does not contain or replicate Anthropic's proprietary system prompts. Each tier uses Limitless Claude's own functional coding instructions designed to optimize tool usage and planning.
> - The candidate lists below represent the built-in pool. During setup, `scripts/setup.js` dynamically queries your active OmniRoute providers and filters out any candidate whose provider is not currently authenticated.

---

## 1. Haiku Tier (`combo/limitless-haiku`)
* **Role:** Low-latency syntax lookups, quick edits, file searches, fast tool responses.
* **Routing Strategy:** Priority Waterfall (`priority`)
* **Candidates (in order of cascade):**

| Priority | Model ID | Provider | Billing Class | Notes |
|---|---|---|---|---|
| 1 | `github/gpt-4o-mini` | GitHub Copilot | Subscription-Entitled | Fast, capable token processing. |
| 2 | `antigravity/gemini-3.1-flash-lite` | Antigravity | Subscription-Entitled / Free | Ultra-low latency code completions. |
| 3 | `kiro/qwen3-coder-next` | Kiro | Subscription-Entitled | Strong coding syntax understanding. |
| 4 | `groq/llama-3.1-8b-instant` | Groq | Zero-Marginal-Cost | Extreme inference speed (~700 tokens/sec). |
| 5 | `openrouter/z-ai/glm-5.2:free` | OpenRouter | Zero-Marginal-Cost | General open-source fallback. |
| 6 | `openrouter/qwen/qwen3.8-27b:free` | OpenRouter | Zero-Marginal-Cost | Balanced parameter size. |
| 7 | `openrouter/nvidia/nemotron-3.5-lightning:free` | OpenRouter | Zero-Marginal-Cost | Final low-cost safety net. |

---

## 2. Sonnet Tier (`combo/limitless-sonnet`)
* **Role:** System architecture, multi-step planning, chain-of-thought analysis, bug investigation.
* **Routing Strategy:** Priority Waterfall (`priority`)
* **Candidates (in order of cascade):**

| Priority | Model ID | Provider | Billing Class | Notes |
|---|---|---|---|---|
| 1 | `antigravity/claude-sonnet-4-6` | Antigravity | Subscription-Entitled | Flagship reasoning baseline. |
| 2 | `bluesminds/deepseek-reasoner` | BluesMinds | Subscription-Entitled | Deep chain-of-thought analysis. |
| 3 | `antigravity/claude-opus-4-6-thinking` | Antigravity | Subscription-Entitled | Deep mathematical & architectural synthesis. |
| 4 | `github/gpt-4o-2024-11-20` | GitHub Copilot | Subscription-Entitled | High-reliability structured tool calling. |
| 5 | `kiro/glm-5` | Kiro | Subscription-Entitled | Extended context reasoning. |
| 6 | `huggingchat/CohereLabs/command-a-reasoning-08-2025` | HuggingChat | Zero-Marginal-Cost | Open-weight reasoning fallback. |

---

## 3. Opus Tier (`combo/limitless-opus`)
* **Role:** High-volume workhorse for extensive code writing, refactoring, and multi-agent loops.
* **Routing Strategy:** Round-Robin Load-Balancing (`round-robin`)
* **Candidates (Load-Balanced Fleet):**

| # | Model ID | Provider | Billing Class | Notes |
|---|---|---|---|---|
| 1 | `kiro/qwen3-coder-next` | Kiro | Subscription-Entitled | High-quality code output. |
| 2 | `mistral/codestral-latest` | Mistral | Paid Inference | Specialized code completion engine. |
| 3 | `kiro/deepseek-3.2` | Kiro | Subscription-Entitled | Fast, robust refactoring. |
| 4 | `openrouter/z-ai/glm-5.2:free` | OpenRouter | Zero-Marginal-Cost | Free tier load-balancer. |
| 5 | `openrouter/qwen/qwen3.8-27b:free` | OpenRouter | Zero-Marginal-Cost | Free coding capacity. |
| 6 | `openrouter/poolside/laguna-s-2.1:free` | OpenRouter | Zero-Marginal-Cost | Open coding model. |
| 7 | `bluesminds/gpt-5.5` | BluesMinds | Subscription-Entitled | General developer model. |
| 8 | `ollama-cloud/glm-5.3` | Ollama Cloud | Zero-Marginal-Cost | Community cloud endpoint. |
| 9 | `bluesminds/kimi-k3` | BluesMinds | Subscription-Entitled | Long-context coding assistant. |
| 10 | `kiro/glm-5` | Kiro | Subscription-Entitled | Architecture and code synthesis. |
| 11 | `openrouter/liquid/lfm-2.5-2.6b:free` | OpenRouter | Zero-Marginal-Cost | Lightweight edge helper. |
| 12 | `huggingchat/deepseek-ai/DeepSeek-V4-Pro` | HuggingChat | Zero-Marginal-Cost | Web-authenticated open-weight pro model. |
| 13 | `huggingchat/Qwen/Qwen3.6-27B` | HuggingChat | Zero-Marginal-Cost | Open coding model. |
| 14 | `opencode/deepseek-v4-flash-free` | OpenCode | Zero-Marginal-Cost | Flash developer model. |
| 15 | `opencode/big-pickle` | OpenCode | Zero-Marginal-Cost | High-parameter open model. |
| 16 | `muse-spark-web/muse-spark-thinking` | Muse Spark | Zero-Marginal-Cost | Experimental reasoning. |
| 17 | `muse-spark-web/muse-spark` | Muse Spark | Zero-Marginal-Cost | Experimental fast lane. |

---

## 4. Fable Tier (`combo/limitless-fable`)
* **Role:** High-context synthesis, complex debugging, authoritative multi-agent architectural decisions.
* **Routing Strategy:** Round-Robin Load-Balancing (`round-robin`)
* **Candidates (Load-Balanced Pool):**

| # | Model ID | Provider | Billing Class | Notes |
|---|---|---|---|---|
| 1 | `github/gpt-4o-2024-11-20` | GitHub Copilot | Subscription-Entitled | High accuracy tool use. |
| 2 | `antigravity/claude-opus-4-6-thinking` | Antigravity | Subscription-Entitled | Maximum reasoning depth. |
| 3 | `antigravity/gemini-3.1-pro-low` | Antigravity | Subscription-Entitled | Massive context ingestion. |
| 4 | `openrouter/moonshotai/kimi-k3` | OpenRouter | Paid Inference | 2M+ context window capacity. |
| 5 | `openrouter/z-ai/glm-5.3` | OpenRouter | Paid Inference | Flagship multi-lingual coding. |
| 6 | `openrouter/qwen/qwen-3.8-coder-32b-instruct` | OpenRouter | Paid Inference | Instruction-tuned coding model. |

---

## 5. Model Aliases & Route Mappings

In OmniRoute's SQLite database, requests are routed based on pattern matching in `model_combo_mappings`:

| Mapping ID | Pattern | Target Combo | Priority | Description |
|---|---|---|---|---|
| `mapping/limitless-opus` | `*opus*` | `combo/limitless-opus` | 10 | Primary Opus routing |
| `mapping/limitless-sonnet` | `*sonnet*` | `combo/limitless-sonnet` | 10 | Primary Sonnet routing |
| `mapping/limitless-haiku` | `*haiku*` | `combo/limitless-haiku` | 10 | Primary Haiku routing |
| `mapping/limitless-fable` | `*fable*` | `combo/limitless-fable` | 10 | Primary Fable routing |
| `mapping/limitless-best` | `*best*` | `combo/limitless-fable` | 9 | `best` alias routes to Fable |
| `mapping/limitless-opusplan` | `*opusplan*` | `combo/limitless-sonnet` | 9 | `opusplan` alias routes to Sonnet |
| `mapping/limitless-default` | `*default*` | `combo/limitless-opus` | 8 | Default fallback routes to Opus |
| `mapping/limitless-opus1m` | `*opus[1m]*` | `combo/limitless-opus` | 11 | Extended context Opus alias |
| `mapping/limitless-sonnet1m` | `*sonnet[1m]*` | `combo/limitless-sonnet` | 11 | Extended context Sonnet alias |
