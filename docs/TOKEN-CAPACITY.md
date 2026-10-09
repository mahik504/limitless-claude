# Limitless Claude Token Capacity Estimates

Limitless Claude is an orchestration layer. It does not provide free inference natively—it optimizes the free and paid quotas you already have across providers like OpenRouter, HuggingChat, Kiro, and Antigravity.

By load-balancing and prioritizing across these accounts, Limitless Claude unlocks an **estimated aggregate token capacity of up to ~28,000,000 tokens per day**.

> **Disclaimer**: This is a *theoretical estimate* based on published rate limits, average context utilization (assumed 1,500 - 3,000 tokens per request for coding), and provider tier assumptions as of October 2026. **It is not a guaranteed SLA.**

---

## The $10 OpenRouter Tip (Unlocking 8M+ Tokens/Day)

The largest bottleneck for free open-source models is often OpenRouter's free tier, which normally throttles usage to ~50 requests per day to prevent abuse. 
However, **if you deposit a minimum of $10 into your OpenRouter account**, your rate limit for *free* models jumps to **1,000 requests per day** (or 10 requests per minute). 
*You do not actually have to spend the $10*—as long as your account is funded, the increased limits apply to all `:free` models.

By leveraging this, the **Opus Tier** (which contains dozens of high-quality free OpenRouter models) can comfortably route up to 1000 coding requests a day. At ~4000 tokens per round-trip, this alone yields roughly **4-8 Million zero-marginal-cost tokens daily**.

---

## Tier-by-Tier Capacity Breakdown

### 1. Haiku Tier (Speed)
*Purpose:* Rapid syntax lookups, latency-sensitive edits.
* **Included Providers:** Groq, Antigravity (Gemini Flash Lite), OpenRouter (Free), Kiro.
* **Constraint:** Groq's Llama 3.1 8B offers 14,400 requests/day. Gemini API free tier allows 1,500 requests/day.
* **Estimate:** ~1.5 to 3 Million Tokens / Day.
* **Category:** Zero-Marginal-Cost.

### 2. Sonnet Tier (Reasoning)
*Purpose:* Chain-of-thought, architectural planning, code review.
* **Included Providers:** Antigravity (Claude/Opus Thinking), Bluesminds (DeepSeek Reasoner), HuggingChat (Command R).
* **Constraint:** Bluesminds/Antigravity have high internal request caps (1,000 - 2,500 daily requests) but lower RPM limits.
* **Estimate:** ~2.5 Million Tokens / Day.
* **Category:** Mixed (Free & API-Key Quotas).

### 3. Opus Tier (Coding Reservoir)
*Purpose:* The massive workhorse for raw code generation and multi-agent development.
* **Included Providers:** OpenRouter (Free), Mistral, Ollama-Cloud, Muse-Spark.
* **Constraint:** Heavily relies on the OpenRouter 1,000-request limit. The Round-Robin strategy ensures we don't trip RPM (Requests Per Minute) limits on a single model. 
* **Estimate:** ~14 Million Tokens / Day (Assuming fully populated 15+ model pool and funded OpenRouter).
* **Category:** Zero-Marginal-Cost (Requires funded OpenRouter balance).

### 4. Fable Tier (Premium God-Mode)
*Purpose:* Complex context synthesis, paid APIs, GitHub Copilot entitlements.
* **Included Providers:** GitHub (GPT-4o), Antigravity, OpenRouter (Paid models like Qwen 32B Instruct).
* **Constraint:** Uses your actual premium API credits and GitHub Copilot token entitlements.
* **Estimate:** ~10 Million Tokens / Day.
* **Category:** Subscription-Entitled & Paid Inference.

---

## Summary of Capacity Classes

When evaluating the **~28M Token** headline, it is critical to separate the capacity by billing type:

| Capacity Type | Expected Volume | Description |
|---|---|---|
| **Zero-Marginal-Cost** | ~18M Tokens | Totally free models (OpenRouter `:free`, HuggingChat, Groq) that incur zero API cost. |
| **Subscription-Entitled** | ~8M Tokens | Models you access via a flat monthly subscription (e.g., GitHub Copilot, Antigravity IDE limits). |
| **Paid Inference** | ~2M+ Tokens | Usage billed per-token on premium models (e.g., Anthropic natively, OpenRouter premium). |

*Note: Measured throughput (the tokens you actually manage to generate during a work session) will always be lower than estimated theoretical capacity. Coding tasks require human reading, testing, and debugging time.*
