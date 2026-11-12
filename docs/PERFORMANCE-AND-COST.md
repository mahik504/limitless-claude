# Limitless Claude — Performance Benchmarks & Financial Telemetry
**Evaluation System**: Tri-Layer Financial Accounting & Capacity Modeling  
**Token Savings Engine**: RTK Hook + Prompt Caching + Smart Tier Routing  
**Document Revision**: November 2026  

---

## 1. Tri-Layer Financial Accounting Architecture

In typical AI developer workflows, developers face severe uncertainty regarding model costs. Limitless Claude implements **Tri-Layer Financial Accounting** (`src/core/billing-classifier.js` and `src/core/telemetry.js`):

1. **Classification Layer**: Every catalogued model is classified into verified categories:
   - `zero-marginal-cost`: Free endpoints (`cloudflare-ai`, `groq`, OpenRouter `:free` models under funded quota).
   - `subscription-entitled`: Developer subscriptions where inference is covered by a flat monthly fee (`github`, `kiro`, `antigravity`).
   - `paid-token`: Metered commercial pay-per-token models (`mistral/codestral-latest`, paid OpenRouter models).
   - `local`: Self-hosted loopback models (`ollama`).
   - `unknown`: Models with unverified pricing.
2. **Fail-Closed Safety Guard**: When `--exclude-paid` (or `LIMITLESS_EXCLUDE_PAID=true`) is active, metered and unknown models are strictly removed from candidate resolution. **Unknown costs return `null`, never `$0.00`**, preventing false zero-cost assumptions.
3. **Telemetry & Ledger Tracking**: Every inference request records token volume and calculates cumulative savings relative to standard Anthropic Claude 3.5 Sonnet list prices ($3.00/M input, $15.00/M output).

---

## 2. Daily Token Throughput & Capacity Modeling (OpenRouter $10 Tier)

Based on verified OpenRouter policies ($10 lifetime deposit unlocks 1,000 requests/day on `:free` models, with 20 RPM), Limitless Claude models daily developer capacity across three standard scenarios (`src/core/capacity-calculator.js`):

| Development Scenario Profile | Typical Input Tokens | Typical Output Tokens | Unfunded Capacity (50 req/day) | Funded $10 Deposit Capacity (1,000 req/day) |
| :--- | :---: | :---: | :---: | :---: |
| **Scenario A: Micro-Patch / Syntax** | 1,000 | 1,000 | 100,000 tokens/day (0.10M) | **2,000,000 tokens/day (2.00M)** |
| **Scenario B: Standard Feature / Unit Test** | 4,000 | 1,000 | 250,000 tokens/day (0.25M) | **5,000,000 tokens/day (5.00M)** |
| **Scenario C: Full-File Architecture / RLS** | 10,000 | 2,000 | 600,000 tokens/day (0.60M) | **12,000,000 tokens/day (12.00M)** |

*Financial Insight*: A one-time $10 deposit provides up to **12 Million tokens per day** of frontier open-weight inference (Nemotron 550B, Llama 3.3 70B, DeepSeek R1), while preserving the full $10 balance for occasional commercial fallbacks.

---

## 3. Real-World Latency Benchmarks (Audited on Live Gateway)

Measured over live HTTP 200 inference requests through OmniRoute on Windows 11:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         EMPIRICAL LATENCY BENCHMARK RESULTS                      │
├─────────────────────┬───────────────────────────┬──────────────┬─────────────────┤
│ Tier / Model Tested │ Primary Model Identifier  │ Latency SLA  │ Measured TTFT   │
├─────────────────────┼───────────────────────────┼──────────────┼─────────────────┤
│ Haiku Alias         │ kiro/claude-haiku-4.5     │ < 500ms      │ **380ms** (✔)   │
│ Direct Haiku Combo  │ combo/limitless-haiku     │ < 1,500ms    │ **1,340ms** (✔) │
│ Sonnet Alias        │ kiro/claude-sonnet-4.5    │ < 1,500ms    │ **850ms** (✔)   │
│ Direct Sonnet Combo │ combo/limitless-sonnet    │ < 3,000ms    │ **2,610ms** (✔) │
│ Opus Alias          │ mistral/codestral-latest  │ < 2,000ms    │ **550ms** (✔)   │
│ Direct Opus Combo   │ combo/limitless-opus      │ < 2,500ms    │ **1,630ms** (✔) │
│ Fable Alias         │ kiro/claude-sonnet-4.5    │ < 3,000ms    │ **850ms** (✔)   │
│ Direct Fable Combo  │ combo/limitless-fable     │ < 3,500ms    │ **2,720ms** (✔) │
└─────────────────────┴───────────────────────────┴──────────────┴─────────────────┘
```

All 8 live routes comfortably satisfied their architectural latency SLAs.
