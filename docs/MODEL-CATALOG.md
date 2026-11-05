# Limitless Claude Model Catalog (v6.1.0)

This document details the candidate models, routing ring positions, dynamic discovery engine, and architecture configured across the four Limitless Claude tiers in `v6.1.0`.

> **Architecture & Protocol Notice**:
> - The tier names **Haiku 5.5**, **Sonnet 5.5**, **Opus 5.5**, and **Fable 5.1** represent **internal Limitless Claude composite routing profiles**.
> - Each tier operates an **interleaved round-robin ring**, dynamically alternating across distinct upstream providers on every interaction turn.
> - Official Anthropic behavioral guidelines, XML tool schemas, and effort level parameters (`<antml:reasoning_effort>`) are injected at the combo level via OmniRoute's `system_message` engine to harmonize output tone and tool execution across all models.
> - Direct model passthrough is supported: explicit provider calls (such as `kiro/claude-sonnet-4.5`, `antigravity/claude-opus-4-6-thinking`, or `mistral/codestral-latest`) bypass combo rings and route straight to the requested upstream provider.

---

## 1. Haiku 5.5 Tier (`combo/limitless-haiku`)
* **Role:** Sub-second syntax verification, rapid linting, atomic git diffs, bash commands, and fast tool execution.
* **Tier Limit:** Strictly 6 models.
* **Routing Strategy:** Interleaved Round-Robin (`round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Speed / TTFT | Specialization |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `antigravity/gemini-3.5-flash-lite` | Antigravity | 620ms | Native tool-calling agent with sub-second execution |
| 2 | `antigravity/gemini-3-flash` | Antigravity | 1.1s | Fast multimodal reasoning agent |
| 3 | `groq/openai/gpt-oss-20b` | Groq | 590ms | Ultra-fast LPU sub-second rapid execution |
| 4 | `cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Cloudflare AI | 680ms | 10,000 req/day edge compute fast buffer |
| 5 | `kilo-gateway/nvidia/nemotron-3.5-lightning:free` | Kilo Gateway | 1.1s | Fast Nemotron lightweight free route |
| 6 | `github/gpt-4o-mini` | GitHub Copilot | 1.2s | Copilot lightweight agent anchor |

---

## 2. Sonnet 5.5 Tier (`combo/limitless-sonnet`)
* **Role:** Architectural system planning, chain-of-thought analysis, multi-step debugging, flaw detection, and creative engineering.
* **Tier Limit:** Strictly 8 smart models.
* **Routing Strategy:** Priority Waterfall / Interleaved Round-Robin (`priority-waterfall` / `round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Context Window | Specialization |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `kiro/claude-sonnet-4.5` | Kiro | 200,000 | Ultra-fast verified Claude Sonnet route |
| 2 | `antigravity/gemini-3-flash` | Antigravity | 1,000,000 | 1M-token multimodal architecture planning |
| 3 | `kiro/glm-5` | Kiro | 200,000 | Zhipu AI GLM-5 frontier planning |
| 4 | `kiro/qwen3-coder-next` | Kiro | 200,000 | Next-generation agentic code reasoning |
| 5 | `kiro/minimax-m2.5` | Kiro | 200,000 | Deep architectural reasoning & flaw analysis |
| 6 | `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Cloudflare AI | 32,768 | DeepSeek R1 reasoning distilled into Qwen 32B |
| 7 | `cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Cloudflare AI | 128,000 | Edge-accelerated Llama 3.3 70B reasoning |
| 8 | `github/gpt-4o` | GitHub Copilot | 128,000 | OpenAI flagship architecture baseline |

---

## 3. Opus 5.5 Tier (`combo/limitless-opus`)
* **Role:** High-capacity agentic coding reservoir for full-stack web applications, 3D creative web (Three.js/R3F), Android development, multi-agent loops, and deep recursive refactoring.
* **Tier Capacity:** 18 models (expandable up to 25).
* **Routing Strategy:** Interleaved Round-Robin across distinct providers (`round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Context Window | Specialization |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `mistral/codestral-latest` | Mistral AI | 32,768 | Mistral flagship code completion engine (535ms) |
| 2 | `antigravity/claude-opus-4-6-thinking` | Antigravity | 200,000 | Authentic Opus with native extended chain-of-thought |
| 3 | `kiro/glm-5` | Kiro | 200,000 | Zhipu AI GLM-5 frontier reasoning engine |
| 4 | `kiro/qwen3-coder-next` | Kiro | 200,000 | Alibaba Qwen 3 Coder Next generation weights |
| 5 | `kiro/claude-sonnet-4.5` | Kiro | 200,000 | Native Claude Sonnet high-throughput route |
| 6 | `kiro/deepseek-3.2` | Kiro | 200,000 | DeepSeek 3.2 high-accuracy coding model |
| 7 | `cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct` | Cloudflare AI | 32,768 | Qwen 2.5 Coder 32B edge coding specialist |
| 8 | `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Cloudflare AI | 32,768 | DeepSeek R1 reasoning distilled into Qwen 32B |
| 9 | `groq/openai/gpt-oss-120b` | Groq | 128,000 | High-parameter OSS agent model (711ms) |
| 10 | `kilo-gateway/nvidia/nemotron-3-ultra-550b-a55b:free` | Kilo Gateway | 1,000,000 | Nemotron 3 Ultra 550B MoE coding flagship |
| 11 | `ollama-cloud/nemotron-3-ultra` | Ollama Cloud | 1,000,000 | Redundant Nemotron 3 Ultra free cloud route |
| 12 | `github/gpt-4o` | GitHub Copilot | 128,000 | Flagship OpenAI coding anchor |
| 13 | `github/gpt-4o-2024-11-20` | GitHub Copilot | 128,000 | Upgraded GPT-4o coding snapshot |
| 14 | `antigravity/gpt-oss-120b-medium` | Antigravity | 128,000 | Enterprise OSS 120B inference |
| 15 | `kilo-gateway/cohere/north-mini-code:free` | Kilo Gateway | 256,000 | Cohere North agentic coding model |
| 16 | `openrouter/cohere/north-mini-code:free` | OpenRouter | 256,000 | Cohere North free agentic coding route |
| 17 | `kilo-gateway/nvidia/nemotron-3.5-lightning:free` | Kilo Gateway | 1,000,000 | High-throughput 1M context coding reader |
| 18 | `openrouter/nvidia/nemotron-3.5-lightning:free` | OpenRouter | 1,000,000 | High-throughput 1M context free reader |

---

## 4. Fable 5.1 Tier (`combo/limitless-fable`)
* **Role:** Elite composite intelligence tier for extreme reasoning depth, massive cross-repository context synthesis, and authoritative technical leadership.
* **Tier Limit:** Strictly 5 heavyweight models.
* **Routing Strategy:** Interleaved Round-Robin (`round-robin`)
* **Golden Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Cost Class | Context Window | Specialization |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `antigravity/claude-opus-4-6-thinking` | Antigravity | Subscription | 200,000 | Authentic Opus extended chain-of-thought (2.7s) |
| 2 | `kiro/deepseek-3.2` | Kiro | Subscription | 200,000 | Native high-parameter DeepSeek route |
| 3 | `kiro/glm-5` | Kiro | Subscription | 200,000 | Zhipu AI GLM-5 flagship reasoning |
| 4 | `github/gpt-4o-2024-11-20` | GitHub Copilot | Subscription | 128,000 | Official OpenAI flagship frontier model |
| 5 | `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Cloudflare AI | Zero-Marginal-Cost | 32,768 | DeepSeek R1 distilled reasoning engine |

---

## 5. Dynamic Multi-Provider Heuristic Engine

When Limitless Claude is installed on a new machine or cloned into an environment with custom, arbitrary, or limited providers (e.g., a developer with only 3 to 5 connected providers such as Together AI, Fireworks, Ollama, Groq, or DeepSeek), the setup script does **not** fail or require manual editing of candidate arrays.

### Runtime Classification Logic
The setup engine (`scripts/setup.js`) performs dynamic inspection of every model reported by OmniRoute:

1. **Catalog Scan:** Discovers all active models from the live OmniRoute `/v1/models` endpoint.
2. **Capability Analysis:** Inspects model identifiers, roots, and advertised capabilities:
   - **Haiku (Max 6):** Matches models containing `flash`, `instant`, `mini`, `haiku`, `lightning`, `fast`, `small`, `lite`, `nano`, `turbo`, `20b`, `8b`, or `7b` (excluding heavy reasoning tags).
   - **Sonnet (Max 8):** Matches models containing `sonnet`, `coder`, `code`, `laguna`, `north`, `reasoning`, `instruct`, `32b`, or `70b`.
   - **Fable (Max 5):** Matches models containing `fable`, `frontier`, `r1`, `o1`, `o3`, `max`, `tiered`, or `pro-preview`.
   - **Opus (Max 25):** Matches models containing `opus`, `codestral`, `ultra`, `large`, `moe`, `deepseek`, `glm`, `qwen`, `550b`, `120b`, or `397b`.
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
> Because the tier mappings use `claude*<tier>*` rather than greedy universal wildcards, explicit provider-prefixed model names (such as `kiro/claude-sonnet-4.5`, `antigravity/claude-opus-4-6-thinking`, or `mistral/codestral-latest`) do not match the combo patterns. OmniRoute automatically proxies them directly to the specified provider endpoint without combo interception.
