# Limitless Claude Token Capacity Estimates

> **Important Conceptual Note**: Limitless Claude is a local orchestration and model-routing harness, not an AI inference provider. It does not generate or vend free tokens itself. It aggregates, waterfall-cascades, and round-robin load-balances the quotas and entitlements you already hold across providers (e.g., OpenRouter, Groq, GitHub Copilot, Antigravity, Kiro, HuggingChat).

Under transparent assumptions detailed below, this architecture supports an **estimated theoretical modeled capacity of up to ~28,000,000 tokens per day**.

---

## 1. Core Modeling Methodology

To make this calculation reproducible for any engineer, all estimates use explicit, standardized parameters:

| Parameter | Standard Value | Description |
|---|---|---|
| **Average Input Tokens ($T_{in}$)** | 2,000 tokens | Context window payload (system prompt, repo excerpts, tool definitions). |
| **Average Output Tokens ($T_{out}$)** | 500 tokens | Generated code edits, explanations, or tool calls. |
| **Average Round-Trip ($T_{req}$)** | 2,500 tokens | Combined total tokens per single request round-trip ($T_{in} + T_{out}$). |
| **Calculation Formula** | $C_{daily} = RPD \times T_{req}$ | Daily Token Capacity = Assumed Requests Per Day $\times$ Tokens Per Request. |
| **Concurrency Assumption** | Parallel / Non-blocking | Assumes requests are distributed throughout the 24-hour cycle without hitting instantaneous burst limits. |

### Quota Classification Tiers
1. **Zero-Marginal-Cost (ZMC):** Free API tiers and community endpoints that incur zero per-token cost (Groq, OpenRouter `:free`, HuggingChat, Ollama Cloud, OpenCode).
2. **Subscription-Entitled (SUB):** Included within flat monthly subscriptions you already pay for (GitHub Copilot, Antigravity IDE, Kiro).
3. **Paid Inference (PAID):** Metered per-token API usage (Mistral, OpenRouter paid models).

---

## 2. Tier-by-Tier Capacity Breakdown

### ⚡ Tier 1: Haiku (Speed Waterfall)
- **Role:** Ultra-low latency syntax checks, file tree lookups, grep queries, instant tool executions.
- **Candidate Models:**
  - `github/gpt-4o-mini` (SUB)
  - `antigravity/gemini-3.1-flash-lite` (SUB / Free API)
  - `kiro/qwen3-coder-next` (SUB)
  - `groq/llama-3.1-8b-instant` (ZMC)
  - `openrouter/z-ai/glm-5.2:free` (ZMC)
  - `openrouter/qwen/qwen3.8-27b:free` (ZMC)
  - `openrouter/nvidia/nemotron-3.5-lightning:free` (ZMC)
- **Primary Quota Drivers:**
  - Groq Llama 3.1 8B offers a published tier of 14,400 requests/day (30 RPM, 6,000 TPM limit).
  - Google Gemini API free tier allows 1,500 requests/day (15 RPM).
- **Assumed Operational Allocation:** 1,000 requests/day allocated to rapid Haiku queries.
- **Estimated Average Round-Trip:** 2,500 tokens (1,800 in / 700 out).
- **Modeled Daily Capacity:** **~2,500,000 tokens/day** (Range: 1.5M - 3.0M).
- **Access Class:** Predominantly Zero-Marginal-Cost with Subscription fallback.
- **Quota Overlap Note:** GitHub Copilot quota is shared with Fable; Antigravity quota is shared with Sonnet.
- **Verification Date & Uncertainty:** Verified Q4 2026. Low uncertainty for Groq; moderate uncertainty for OpenRouter free availability.

---

### 🧠 Tier 2: Sonnet (Reasoning Waterfall)
- **Role:** Architectural planning, chain-of-thought analysis, multi-file refactoring plans, code review.
- **Candidate Models:**
  - `antigravity/claude-sonnet-4-6` (SUB)
  - `bluesminds/deepseek-reasoner` (SUB)
  - `antigravity/claude-opus-4-6-thinking` (SUB)
  - `github/gpt-4o-2024-11-20` (SUB)
  - `kiro/glm-5` (SUB)
  - `huggingchat/CohereLabs/command-a-reasoning-08-2025` (ZMC)
- **Primary Quota Drivers:**
  - Antigravity IDE and BluesMinds subscription allowances typically support 500–1,500 requests/day with strict reasoning RPM ceilings.
- **Assumed Operational Allocation:** 1,000 requests/day.
- **Estimated Average Round-Trip:** 2,500 tokens (higher reasoning chain, average output 600 tokens).
- **Modeled Daily Capacity:** **~2,500,000 tokens/day**.
- **Access Class:** Subscription-Entitled with Zero-Marginal-Cost fallback.
- **Quota Overlap Note:** Antigravity and GitHub quotas are shared across Sonnet and Fable. Concurrent high volume in both tiers will draw down the common allocation.
- **Verification Date & Uncertainty:** Verified Q4 2026. Moderate uncertainty; reasoning models enforce dynamic RPM throttle.

---

### 🛠️ Tier 3: Opus (Coding Reservoir / Round-Robin)
- **Role:** High-volume workhorse for multi-agent loops, large diff writing, test generation.
- **Candidate Models (17 Endpoints):**
  - `kiro/qwen3-coder-next` (SUB)
  - `mistral/codestral-latest` (PAID - opt-in)
  - `kiro/deepseek-3.2` (SUB)
  - `openrouter/z-ai/glm-5.2:free` (ZMC)
  - `openrouter/qwen/qwen3.8-27b:free` (ZMC)
  - `openrouter/poolside/laguna-s-2.1:free` (ZMC)
  - `bluesminds/gpt-5.5` (SUB)
  - `ollama-cloud/glm-5.3` (ZMC)
  - `bluesminds/kimi-k3` (SUB)
  - `kiro/glm-5` (SUB)
  - `openrouter/liquid/lfm-2.5-2.6b:free` (ZMC)
  - `huggingchat/deepseek-ai/DeepSeek-V4-Pro` (ZMC)
  - `huggingchat/Qwen/Qwen3.6-27B` (ZMC)
  - `opencode/deepseek-v4-flash-free` (ZMC)
  - `opencode/big-pickle` (ZMC)
  - `muse-spark-web/muse-spark-thinking` (ZMC)
  - `muse-spark-web/muse-spark` (ZMC)
- **Primary Quota Driver & The OpenRouter Mechanism:**
  - OpenRouter normally throttles unverified free accounts to ~50 RPD.
  - **Account Funding Mechanism:** If an account holds a $10 deposit balance, OpenRouter expands the free tier rate limit on all `:free` models to **1,000 requests/day** (10 RPM). Because the balance is not spent when calling `:free` endpoints, this unlocks high throughput at zero marginal cost.
  - By rotating across 17 distinct candidate endpoints using round-robin distribution, the Opus tier evades single-model RPM throttling.
- **Assumed Operational Allocation:** ~4,500 to 5,500 requests/day distributed across the 17-model pool.
- **Estimated Average Round-Trip:** 2,500 to 3,000 tokens (bulk coding generation).
- **Modeled Daily Capacity:** **~14,000,000 tokens/day**.
- **Access Class:** Predominantly Zero-Marginal-Cost (requires funded OpenRouter balance for full throughput).
- **Verification Date & Uncertainty:** Historical OpenRouter policy verified Q4 2026. Moderate uncertainty: individual free model availability on OpenRouter varies based on host capacity.

---

### 👑 Tier 4: Fable (God-Mode / Round-Robin)
- **Role:** High-context synthesis, complex debugging, authoritative multi-agent architectural decisions.
- **Candidate Models:**
  - `github/gpt-4o-2024-11-20` (SUB)
  - `antigravity/claude-opus-4-6-thinking` (SUB)
  - `antigravity/gemini-3.1-pro-low` (SUB)
  - `openrouter/moonshotai/kimi-k3` (PAID)
  - `openrouter/z-ai/glm-5.3` (PAID)
  - `openrouter/qwen/qwen-3.8-coder-32b-instruct` (PAID)
- **Primary Quota Drivers:**
  - Leverages monthly developer subscriptions (GitHub Copilot enterprise/student tier, Antigravity) alongside metered high-performance models.
- **Assumed Operational Allocation:** ~2,500 requests/day.
- **Estimated Average Round-Trip:** 3,500 to 4,000 tokens (large context prompts).
- **Modeled Daily Capacity:** **~9,000,000 tokens/day**.
- **Access Class:** Subscription-Entitled & Metered Paid Inference.
- **Verification Date & Uncertainty:** Verified Q4 2026. High dependency on user's active subscription tier and paid balance.

---

## 3. Aggregate Capacity Summary

| Tier | Routing Strategy | Primary Access Type | Target RPD | Tokens / Req | Modeled Daily Capacity |
|---|---|---|---|---|---|
| **Haiku** | Priority Waterfall | Zero-Marginal-Cost (Groq / Gemini) | ~1,000 | 2,500 | **~2,500,000** |
| **Sonnet** | Priority Waterfall | Subscription-Entitled (Antigravity / BluesMinds) | ~1,000 | 2,500 | **~2,500,000** |
| **Opus** | Round-Robin | Zero-Marginal-Cost (17 Models Pool) | ~5,000 | 2,800 | **~14,000,000** |
| **Fable** | Round-Robin | Subscription & Paid (Copilot / Antigravity) | ~2,500 | 3,600 | **~9,000,000** |
| **TOTAL** | Hybrid | Fleet Aggregation | ~9,500 | 2,950 avg | **~28,000,000 tokens/day** |

### Breakdown by Billing Class

```
┌──────────────────────────────────────────────────────────┐
│ THEORETICAL MODELED CAPACITY: ~28,000,000 TOKENS / DAY   │
├──────────────────────────┬───────────────────────────────┤
│ Zero-Marginal-Cost (ZMC) │ ~16.5M tokens (59%)           │
│ Subscription-Entitled    │ ~8.5M tokens (30%)            │
│ Metered Paid Inference   │ ~3.0M tokens (11%)            │
└──────────────────────────┴───────────────────────────────┘
```

---

## 4. Crucial Caveats & Real-World Throughput

1. **Theoretical Ceiling vs. Human Throughput:**
   In real-world solo coding, an engineer spends significant time reading diffs, writing tests, thinking, and reviewing git changes. Generating 28 million tokens daily is a theoretical pool capacity intended for heavy multi-agent loops and team setups, not single-threaded interactive human typing.
2. **Concurrent Availability Assumption:**
   The calculation models maximum aggregate throughput assuming all upstream providers and free endpoints operate simultaneously without service disruptions.
3. **Shared Quota Deduplication:**
   If your GitHub Copilot subscription is called by both Sonnet and Fable, requests issued by Sonnet directly decrement the remaining volume for Fable. Limitless Claude does not duplicate physical provider allowances.
4. **Rate Limits (RPM vs. RPD):**
   A daily quota of 14,400 requests on Groq does not allow sending 14,400 requests in 10 minutes. OmniRoute waterfalls to subsequent candidates when instantaneous RPM boundaries are reached.
5. **No Guarantee or SLA:**
   Provider quotas, model availability, and pricing terms can change without notice. Verify current upstream conditions in your OmniRoute dashboard (`http://localhost:20128`).
