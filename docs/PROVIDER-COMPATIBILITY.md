# Limitless Claude 7.0.0 — Provider Compatibility & Audit Report

This report provides the full compatibility matrix, authentication types, request formats, and validation statuses for every supported upstream provider.

---

## 1. Provider Lifecycle States

Every provider and model in Limitless Claude 7.0.0 is classified under strict lifecycle stages:
- **`DISCOVERED`**: Endpoint/model ID identified in network scan or upstream catalog.
- **`AUTHENTICATED`**: Valid API key or OAuth credential verified.
- **`AVAILABLE`**: Provider daemon reports active connection without quota/suspension errors.
- **`SMOKE_TESTED`**: Validated via live completion request (`PONG`).
- **`TOOL_CALL_TESTED`**: Validated for JSON schema structured tool execution.
- **`BENCHMARKED`**: Evaluated on 12-task standardized benchmark.
- **`PRODUCTION_APPROVED`**: Formally authorized for autonomous production routing.

---

## 2. Upstream Provider Matrix

| Provider Key | Display Name | Auth Type | Base URL / Endpoint | Protocol | Lifecycle Status | Tier Placement |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **`cloudflare-ai`** | Cloudflare Workers AI | API Token | `https://api.cloudflare.com/client/v4/accounts/{id}/ai/v1` | OpenAI Chat | `PRODUCTION_APPROVED` | Haiku, Sonnet, Opus |
| **`github`** | GitHub Models / Copilot | OAuth Bearer | `https://models.inference.ai.azure.com` | OpenAI Chat | `PRODUCTION_APPROVED` | Haiku, Sonnet, Opus, Fable |
| **`kiro`** | Kiro AI Platform | Bearer Key | `https://api.kiro.ai/v1` | OpenAI Chat | `PRODUCTION_APPROVED` | Sonnet, Opus, Fable |
| **`kilo-gateway`** | Kilo Community Gateway | Bearer Token | `https://gateway.kilo.ai/v1` | OpenAI Chat | `PRODUCTION_APPROVED` | Haiku, Opus |
| **`openrouter`** | OpenRouter Hub | API Key | `https://openrouter.ai/api/v1` | OpenAI Chat | `PRODUCTION_APPROVED` | Haiku, Opus, Fable |
| **`mistral`** | Mistral AI | API Key | `https://api.mistral.ai/v1` | OpenAI Chat | `PRODUCTION_APPROVED` | Opus |
| **`antigravity`** | Antigravity Google One AI | OAuth Bearer | `http://127.0.0.1:20128/proxy/agy` | Google PA / Anthropic | `AVAILABLE` (Degraded guarded) | Haiku, Sonnet, Opus, Fable |
| **`groq`** | Groq LPU Engine | API Key | `https://api.groq.com/openai/v1` | OpenAI Chat | `PRODUCTION_APPROVED` | Haiku, Opus |
| **`ollama-cloud`** | Ollama Cloud | API Key | `https://ollama.com/api/v1` | OpenAI Chat | `PRODUCTION_APPROVED` | Opus |
| **`opencode-go`** | OpenCode Go | Subscription Key | `https://api.opencode.ai/v1` | OpenAI Chat | `AUTHENTICATED` | Haiku, Sonnet, Opus |
| **`opencode-zen`** | OpenCode Zen | Metered Key | `https://zen.opencode.ai/v1` | OpenAI Chat | `AUTHENTICATED` | Haiku, Sonnet, Opus |
| **`native`** | Official Anthropic API | API Key | `https://api.anthropic.com/v1/messages` | Anthropic Messages | `AVAILABLE` (Direct profile) | Native Profile |

---

## 3. Provider Detailed Analysis

### A. Cloudflare Workers AI (`cloudflare-ai`)
- **Key Models:** `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `@cf/qwen/qwen2.5-coder-32b-instruct`, `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`.
- **Measured Latency:** 0.60s - 0.75s.
- **Billing Class:** `zero-marginal-cost`.
- **Tool Calling:** Full OpenAI tool-calling schema compliance.
- **Failure Modes:** Rate limiting on extreme burst; mitigated by 30s cooldown backoff.

### B. GitHub Models (`github`)
- **Key Models:** `gpt-4o`, `gpt-4o-mini`, `gpt-4o-2024-11-20`.
- **Measured Latency:** 0.83s - 1.20s.
- **Billing Class:** `subscription-entitled` (covered under GitHub Copilot seat).
- **Tool Calling:** Native multi-turn tool calling, parallel function execution.
- **Guards:** Guarded strictly against non-existent GitHub model names.

### C. Kiro AI (`kiro`)
- **Key Models:** `claude-sonnet-4.5`, `glm-5`, `qwen3-coder-next`, `deepseek-3.2`.
- **Measured Latency:** 2.50s - 2.80s.
- **Billing Class:** `subscription-entitled`.
- **Strengths:** Outstanding architectural reasoning and chain-of-thought system design. Anchor provider for Sonnet and Fable tiers.

### D. OpenRouter (`openrouter`)
- **Key Models:** `nvidia/nemotron-3.5-lightning:free`, `cohere/north-mini-code:free`, `deepseek/deepseek-chat`.
- **Billing Classes:**
  - `:free` suffix: `zero-marginal-cost` (50 req/day).
  - Funded tier ($10 balance): Increases rate to 1,000 req/day and enables paid wholesale models.
- **Guards:** Free-only filter (`--exclude-paid`) omits paid models unless explicitly permitted.

### E. Antigravity OAuth (`antigravity`)
- **Key Models:** `gemini-2.5-pro`, `gemini-2.5-flash`, `claude-opus-4-6-thinking`.
- **Deprecation Guard:** Handled via `FallbackEngine`. When Google PA returns deprecation strings inside HTTP 200 responses, the circuit breaker immediately trips to `OPEN` and routes traffic to Cloudflare or Kiro alternatives in <500ms.
