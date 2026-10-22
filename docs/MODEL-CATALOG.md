# Limitless Claude Model Catalog (v6.0.0)

This document details the candidate models, routing ring positions, and architecture configured across the four Limitless Claude tiers in `v6.0.0`.

> **Architecture & Protocol Notice**:
> - The tier names **Haiku 5.5**, **Sonnet 5.5**, **Opus 5.5**, and **Fable 5.1** represent **internal Limitless Claude composite routing profiles**.
> - Each tier operates an **interleaved round-robin ring**, dynamically alternating across distinct upstream providers on every interaction turn.
> - Official Anthropic behavioral guidelines, XML tool schemas, and effort level parameters (`<antml:reasoning_effort>`) are injected at the combo level via OmniRoute's `system_message` engine to harmonize output tone and tool execution across all models.
> - Direct model passthrough is supported: explicit provider calls (such as `github/claude-sonnet-5` or `mistral/codestral-latest`) bypass combo rings and route straight to the requested upstream provider.

---

## 1. Haiku 5.5 Tier (`combo/limitless-haiku`)
* **Role:** Sub-second syntax verification, rapid linting, atomic git diffs, bash commands, and fast tool execution.
* **Routing Strategy:** Interleaved Round-Robin (`round-robin`)
* **Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Speed / TTFT | Specialization |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `groq/llama-3.3-70b-versatile` | Groq | 300+ tok/s | World-record inference speed; sub-second TTFT |
| 2 | `antigravity/gemini-3.5-flash-lite` | Antigravity | ~200ms TTFT | Native tool-calling agent with sub-second execution |
| 3 | `openrouter/nvidia/nemotron-3.5-lightning:free` | OpenRouter | Instant | 1M context ultra-fast codebase scanner |
| 4 | `github/claude-haiku-4.5` | GitHub Copilot | ~1.2s | Official Claude Haiku token generation |
| 5 | `cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Cloudflare AI | Fast Edge | 10,000 req/day edge compute buffer |
| 6 | `cerebras/llama-3.3-70b` | Cerebras | Wafer-Scale | High-throughput atomic syntax validation |
| 7 | `kiro/claude-haiku-4.5` | Kiro | Native | Redundant native Claude Haiku endpoint |
| 8 | `kilo-gateway/poolside/laguna-xs-2.1:free` | Kilo Gateway | Fast MoE | Poolside 33B-A3B agentic coding specialist |

---

## 2. Sonnet 5.5 Tier (`combo/limitless-sonnet`)
* **Role:** Architectural system planning, chain-of-thought analysis, multi-step debugging, and code review.
* **Routing Strategy:** Interleaved Round-Robin (`round-robin`)
* **Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Context Window | Specialization |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `github/claude-sonnet-5` | GitHub Copilot | 200,000 | Official Claude Sonnet 5 reasoning baseline |
| 2 | `openrouter/cohere/north-mini-code:free` | OpenRouter | 256,000 | Cohere's dedicated agentic coding model |
| 3 | `kiro/claude-sonnet-5` | Kiro | 200,000 | Native Claude Sonnet 5 redundant route |
| 4 | `antigravity/claude-sonnet-4-6` | Antigravity | 200,000 | Enterprise Claude Sonnet allocation |
| 5 | `openrouter/poolside/laguna-s-2.1:free` | OpenRouter | 256,000 | Poolside flagship coding agent model |
| 6 | `kilo-gateway/nvidia/nemotron-3-super-120b-a12b:free` | Kilo Gateway | 262,144 | NVIDIA 120B MoE architectural reasoning |
| 7 | `openrouter/google/gemma-4-31b-it:free` | OpenRouter | 262,144 | Google DeepMind 30.7B dense multimodal model |
| 8 | `kiro/minimax-m2.5` | Kiro | 200,000 | Deep planning & architectural reasoning |

---

## 3. Opus 5.5 Tier (`combo/limitless-opus`)
* **Role:** High-capacity agentic reservoir for extensive refactoring, full test suite generation, and multi-agent loops.
* **Routing Strategy:** Interleaved Round-Robin across 10 distinct providers (`round-robin`)
* **Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Context Window | Specialization |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `agentrouter/claude-opus-4-8` | AgentRouter | 200,000 | Authentic Claude Opus frontier reasoning |
| 2 | `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` | OpenRouter | 1,000,000 | 550B total / 55B active open frontier model |
| 3 | `ollama-cloud/kimi-k2.7-code` | Ollama Cloud | 200,000 | Moonshot AI Kimi dedicated coding agent |
| 4 | `kiro/glm-5` | Kiro | 200,000 | Zhipu AI GLM-5 frontier reasoning engine |
| 5 | `cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct` | Cloudflare AI | 32,768 | Qwen 2.5 Coder 32B edge coding specialist |
| 6 | `mistral/codestral-latest` | Mistral | 32,768 | Mistral flagship code completion engine |
| 7 | `antigravity/claude-opus-4-6-thinking` | Antigravity | 200,000 | Authentic Opus with native extended chain-of-thought |
| 8 | `bluesminds/deepseek-v4-pro` | BluesMinds | 128,000 | High-parameter DeepSeek V4 enterprise endpoint |
| 9 | `ollama-cloud/qwen3.5:397b` | Ollama Cloud | 200,000 | Massive 397B parameter open reasoning model |
| 10 | `kiro/qwen3-coder-next` | Kiro | 200,000 | Alibaba Qwen 3 Coder Next generation weights |
| 11 | `openrouter/thinkingmachines/inkling:free` | OpenRouter | 1,048,576 | Thinking Machines 1M-context 41B active MoE |
| 12 | `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Cloudflare AI | 32,768 | DeepSeek R1 reasoning distilled into Qwen 32B |
| 13 | `agentrouter/deepseek-v4-flash` | AgentRouter | 128,000 | High-throughput DeepSeek V4 agent model |
| 14 | `ollama-cloud/glm-5.3-flash` | Ollama Cloud | 200,000 | GLM 5.3 Flash cloud endpoint |
| 15 | `kiro/deepseek-3.2` | Kiro | 200,000 | High-accuracy DeepSeek coding fallback |
| 16 | `nvidia/nvidia/nemotron-3-super-120b-a12b` | NVIDIA NIM | 262,144 | Direct NVIDIA NIM enterprise 120B MoE |
| 17 | `kilo-gateway/nvidia/nemotron-3-ultra-550b-a55b:free` | Kilo Gateway | 1,000,000 | Redundant route to Nemotron 3 Ultra 550B |
| 18 | `cloudflare-ai/@cf/zai-org/glm-4.7-flash` | Cloudflare AI | 128,000 | Zhipu AI GLM 4.7 Flash edge instance |

---

## 4. Fable 5.1 Tier (`combo/limitless-fable`)
* **Role:** Premier composite intelligence tier for extreme reasoning depth, massive context synthesis, and complex architecture.
* **Routing Strategy:** Interleaved Round-Robin (`round-robin`)
* **Ring Configuration:**

| Ring Pos | Model Identifier | Provider | Cost Class | Context Window | Specialization |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `github/claude-fable-5` | GitHub Copilot | Subscription | 200,000 | Official Claude Fable frontier model |
| 2 | `openrouter/deepseek/deepseek-v4.1-flash` | OpenRouter | Paid ($0.05/1M) | 1,048,576 | 1M context agentic multi-file reasoning |
| 3 | `antigravity/gemini-3.8-flash-tiered` | Antigravity | Subscription | 1,000,000 | Google DeepMind multimodal frontier model |
| 4 | `openrouter/z-ai/glm-5.3-flash` | OpenRouter | Paid ($0.005/1M) | 1,048,576 | 1M context ultra-cheap frontier throughput |
| 5 | `agentrouter/claude-opus-5` | AgentRouter | Subscription | 200,000 | High-tier Opus 5 reasoning |
| 6 | `openrouter/qwen/qwen3.7-flash` | OpenRouter | Paid ($0.03/1M) | 1,000,000 | 1M context Qwen agentic coding weights |
| 7 | `github/claude-opus-5` | GitHub Copilot | Subscription | 200,000 | Official Claude Opus 5 fallback |
| 8 | `antigravity/claude-opus-4-6-thinking` | Antigravity | Subscription | 200,000 | Extended chain-of-thought frontier model |

---

## 5. Model Aliases & Route Mappings

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
> Because the tier mappings use `claude*<tier>*` rather than greedy universal wildcards, explicit provider-prefixed model names (such as `github/claude-sonnet-5`, `kiro/claude-sonnet-5`, or `mistral/codestral-latest`) do not match the combo patterns. OmniRoute automatically proxies them directly to the specified provider endpoint without combo interception.
