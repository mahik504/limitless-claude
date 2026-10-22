# Limitless Claude Model Catalog (v6.0.0)

This document details the candidate models, routing ring positions, dynamic discovery engine, and architecture configured across the four Limitless Claude tiers in `v6.0.0`.

> **Architecture & Protocol Notice**:
> - The tier names **Haiku 5.5**, **Sonnet 5.5**, **Opus 5.5**, and **Fable 5.1** represent **internal Limitless Claude composite routing profiles**.
> - Each tier operates an **interleaved round-robin ring**, dynamically alternating across distinct upstream providers on every interaction turn.
> - Official Anthropic behavioral guidelines, XML tool schemas, and effort level parameters (`<antml:reasoning_effort>`) are injected at the combo level via OmniRoute's `system_message` engine to harmonize output tone and tool execution across all models.
> - Direct model passthrough is supported: explicit provider calls (such as `github/claude-sonnet-5`, `kiro/claude-sonnet-4.5`, or `mistral/codestral-latest`) bypass combo rings and route straight to the requested upstream provider.

---

## 1. Haiku 5.5 Tier (`combo/limitless-haiku`)
* **Role:** Sub-second syntax verification, rapid linting, atomic git diffs, bash commands, and fast tool execution.
* **Routing Strategy:** Interleaved Round-Robin (`round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Speed / TTFT | Specialization |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `groq/openai/gpt-oss-20b` | Groq | 640ms | Ultra-fast token generation; rapid execution |
| 2 | `antigravity/gemini-3.5-flash-lite` | Antigravity | 2.4s | Native tool-calling agent with sub-second execution |
| 3 | `antigravity/gemini-3-flash` | Antigravity | 1.3s | Multimodal fast reasoning agent |
| 4 | `openrouter/nvidia/nemotron-3.5-lightning:free` | OpenRouter | 738ms | 1M context ultra-fast codebase scanner |
| 5 | `cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Cloudflare AI | 716ms | 10,000 req/day edge compute buffer |
| 6 | `kiro/claude-haiku-4.5` | Kiro | 1.9s | Native Claude Haiku token output |
| 7 | `kilo-gateway/poolside/laguna-xs-2.1:free` | Kilo Gateway | 3.2s | Poolside 33B-A3B agentic coding specialist |
| 8 | `kilo-gateway/nvidia/nemotron-3.5-lightning:free` | Kilo Gateway | 1.2s | High-speed Nemotron free inference |
| 9 | `github/gpt-4o-mini` | GitHub Copilot | 1.4s | Copilot lightweight agent fallback |
| 10 | `github/gpt-4o-2024-11-20` | GitHub Copilot | 1.5s | Copilot full intelligence anchor |

---

## 2. Sonnet 5.5 Tier (`combo/limitless-sonnet`)
* **Role:** Architectural system planning, chain-of-thought analysis, multi-step debugging, and code review.
* **Routing Strategy:** Priority Waterfall / Interleaved Round-Robin (`priority-waterfall` / `round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Context Window | Specialization |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `github/claude-sonnet-5` | GitHub Copilot | 200,000 | Official Claude Sonnet 5 reasoning baseline |
| 2 | `kiro/claude-sonnet-4.5` | Kiro | 200,000 | Ultra-fast 2.7s verified Claude Sonnet route |
| 3 | `antigravity/claude-sonnet-4-6` | Antigravity | 200,000 | Enterprise Claude Sonnet allocation |
| 4 | `openrouter/cohere/north-mini-code:free` | OpenRouter | 256,000 | Cohere's dedicated agentic coding model (660ms) |
| 5 | `openrouter/poolside/laguna-s-2.1:free` | OpenRouter | 256,000 | Poolside flagship coding agent model |
| 6 | `kilo-gateway/cohere/north-mini-code:free` | Kilo Gateway | 256,000 | Redundant free Cohere North route |
| 7 | `kiro/minimax-m2.5` | Kiro | 200,000 | Deep planning & architectural reasoning |
| 8 | `kiro/glm-5` | Kiro | 200,000 | Zhipu AI GLM-5 frontier planning |
| 9 | `kiro/qwen3-coder-next` | Kiro | 200,000 | Next-generation agentic code reasoning |
| 10 | `cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct` | Cloudflare AI | 32,768 | Qwen 2.5 Coder 32B edge coding specialist |

---

## 3. Opus 5.5 Tier (`combo/limitless-opus`)
* **Role:** High-capacity agentic reservoir for extensive refactoring, full test suite generation, and multi-agent loops.
* **Routing Strategy:** Interleaved Round-Robin across distinct providers (`round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Context Window | Specialization |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` | OpenRouter | 1,000,000 | 550B total / 55B active open frontier model (922ms) |
| 2 | `kilo-gateway/nvidia/nemotron-3-ultra-550b-a55b:free` | Kilo Gateway | 1,000,000 | Redundant route to Nemotron 3 Ultra 550B |
| 3 | `mistral/codestral-latest` | Mistral | 32,768 | Mistral flagship code completion engine (535ms) |
| 4 | `antigravity/claude-opus-4-6-thinking` | Antigravity | 200,000 | Authentic Opus with native extended chain-of-thought |
| 5 | `kiro/glm-5` | Kiro | 200,000 | Zhipu AI GLM-5 frontier reasoning engine |
| 6 | `kiro/qwen3-coder-next` | Kiro | 200,000 | Alibaba Qwen 3 Coder Next generation weights |
| 7 | `kiro/deepseek-3.2` | Kiro | 200,000 | High-accuracy DeepSeek coding fallback |
| 8 | `cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct` | Cloudflare AI | 32,768 | Qwen 2.5 Coder 32B edge coding specialist |
| 9 | `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Cloudflare AI | 32,768 | DeepSeek R1 reasoning distilled into Qwen 32B (603ms) |
| 10 | `cloudflare-ai/@cf/zai-org/glm-4.7-flash` | Cloudflare AI | 128,000 | Zhipu AI GLM 4.7 Flash edge instance (1.1s) |
| 11 | `openrouter/qwen/qwen3.7-flash` | OpenRouter | 1,000,000 | 1M-context Qwen agentic coding weights (613ms) |
| 12 | `groq/openai/gpt-oss-120b` | Groq | 128,000 | High-parameter OSS agent model (711ms) |

---

## 4. Fable 5.1 Tier (`combo/limitless-fable`)
* **Role:** Premier composite intelligence tier for extreme reasoning depth, massive context synthesis, and complex architecture.
* **Routing Strategy:** Interleaved Round-Robin (`round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Cost Class | Context Window | Specialization |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `antigravity/claude-opus-4-6-thinking` | Antigravity | Subscription | 200,000 | Authentic Opus extended chain-of-thought (2.7s) |
| 2 | `antigravity/claude-sonnet-4-6` | Antigravity | Subscription | 200,000 | Enterprise Claude Sonnet reasoning |
| 3 | `antigravity/gemini-3.8-flash-tiered` | Antigravity | Subscription | 1,000,000 | Google DeepMind multimodal frontier model (3.3s) |
| 4 | `openrouter/deepseek/deepseek-v4.1-flash` | OpenRouter | Paid ($0.05/1M) | 1,048,576 | 1M context agentic multi-file reasoning (1.5s) |
| 5 | `openrouter/qwen/qwen3.7-flash` | OpenRouter | Paid ($0.03/1M) | 1,000,000 | 1M context Qwen agentic coding weights (613ms) |
| 6 | `github/gpt-4o-2024-11-20` | GitHub Copilot | Subscription | 128,000 | Official OpenAI flagship frontier model (1.5s) |
| 7 | `kiro/deepseek-3.2` | Kiro | Subscription | 200,000 | Native high-parameter DeepSeek route |
| 8 | `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Cloudflare AI | Zero-Marginal-Cost | 32,768 | DeepSeek R1 distilled reasoning engine |

---

## 5. Dynamic Multi-Provider Heuristic Engine

When Limitless Claude is installed on a new machine or cloned into an environment with custom, arbitrary, or limited providers (e.g., a developer with only 3 to 5 connected providers such as Together AI, Fireworks, Ollama, Groq, or DeepSeek), the setup script does **not** fail or require manual editing of candidate arrays.

### Runtime Classification Logic
The setup engine (`scripts/setup.js`) performs dynamic inspection of every model reported by OmniRoute:

1. **Catalog Scan:** Discovers all active models from the live OmniRoute `/v1/models` endpoint.
2. **Capability Analysis:** Inspects model identifiers, roots, and advertised capabilities:
   - **Haiku (Speed & Syntax):** Matches models containing `flash`, `instant`, `mini`, `haiku`, `lightning`, `fast`, `small`, `lite`, `nano`, `turbo`, `20b`, `8b`, or `7b` (excluding heavy reasoning tags).
   - **Fable (Frontier Composite Intelligence):** Matches models containing `fable`, `frontier`, `r1`, `o1`, `o3`, `max`, `tiered`, or `pro-preview`.
   - **Sonnet (Architectural Planning & Reasoning):** Matches models containing `sonnet`, `coder`, `code`, `laguna`, `north`, `reasoning`, `instruct`, `32b`, or `70b`.
   - **Opus (Agentic Heavy Reservoir):** Matches models containing `opus`, `codestral`, `ultra`, `large`, `moe`, `deepseek`, `glm`, `qwen`, `550b`, `120b`, or `397b`.
3. **Provider Interleaving:** Interleaves models by provider within each tier, preventing request clustering and distributing quota consumption evenly.
4. **Billing Guard Safety:** If `--exclude-paid` is invoked, all dynamically matched models are evaluated against `classifyModelBilling()`, excluding chargeable/metered endpoints from candidate pools.

---

## 6. Model Aliases & Route Mappings

In OmniRoute's SQLite database (`model_combo_mappings`), requests are evaluated in order of priority:

| Mapping ID | Pattern | Target Combo | Priority | Behavior |
|---|---|---|:---:|---|
| `mapping/limitless-opusplan` | `*opusplan*` | `combo/limitless-sonnet` | 11 | Routes architectural planning requests to Sonnet |
| `mapping/limitless-sonnet1m` | `*sonnet[1m]*` | `combo/limitless-sonnet` | 11 | Routes 1M context requests to Sonnet ring |
| `mapping/limitless-opus1m` | `*opus[1m]*` | `combo/limitless-opus` | 11 | Routes 1M context requests to Opus ring |
| `mapping/limitless-opus` | `claude*opus*` | `combo/limitless-opus` | 10 | Matches all standard Claude Opus client strings |
| `mapping/limitless-sonnet` | `claude*sonnet*` | `combo/limitless-sonnet` | 10 | Matches all standard Claude Sonnet client strings |
| `mapping/limitless-haiku` | `claude*haiku*` | `combo/limitless-haiku` | 10 | Matches all standard Claude Haiku client strings |
| `mapping/limitless-fable` | `claude*fable*` | `combo/limitless-fable` | 10 | Matches all standard Claude Fable client strings |
| `mapping/limitless-best` | `*best*` | `combo/limitless-fable` | 9 | Routes `best` aliases to Fable |
| `mapping/limitless-default` | `*default*` | `combo/limitless-opus` | 8 | Fallback default route to Opus reservoir |

> **Direct Model Passthrough Guarantee:**
> Because the tier mappings use `claude*<tier>*` rather than greedy universal wildcards, explicit provider-prefixed model names (such as `github/claude-sonnet-5`, `kiro/claude-sonnet-4.5`, or `mistral/codestral-latest`) do not match the combo patterns. OmniRoute automatically proxies them directly to the specified provider endpoint without combo interception.
