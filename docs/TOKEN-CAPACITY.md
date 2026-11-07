# Limitless Claude 8.0 - Token Capacity & Provider Quota Intelligence
*Verified Policy Review: November 2026*

---

## 1. OpenRouter Free Tier Quota Architecture

OpenRouter routes requests across 200+ models, including community `:free` variants. The official rate-limit mechanics are governed as follows:

- **Unfunded Free Tier**: Accounts without deposited credits are capped at **50 requests per day** across all `:free` models.
- **Funded Free Tier (\$10 Credit Deposit)**: Depositing \$10.00 USD into an OpenRouter account unlocks **1,000 requests per day** across `:free` models without consuming the \$10 balance on free endpoints.
- **Upstream Rate Limits**: Individual models within OpenRouter enforce per-minute request caps (typically 20 requests/minute). Limitless Claude's circuit breakers detect HTTP 429 and failover cleanly to alternative providers.

> [!IMPORTANT]
> **Policy Disclaimer (Verified November 2026)**
> These calculations represent maximum theoretical throughput bounds based on documented request allowances. They are not guaranteed quotas. Upstream models may experience outages, concurrency throttling, or token truncation.

---

## 2. Daily Token Throughput Modeling

| Scenario | Input Tokens | Output Tokens | Total Tokens / Req | Daily Throughput (50 Req/Day) | Daily Throughput (1,000 Req/Day) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Micro-Patch / Syntax** | 1,000 | 1,000 | 2,000 | **0.10M tokens/day** | **2.00M tokens/day** |
| **Standard Feature / Unit Test** | 4,000 | 1,000 | 5,000 | **0.25M tokens/day** | **5.00M tokens/day** |
| **Full Architecture / Backend RLS** | 10,000 | 2,000 | 12,000 | **0.60M tokens/day** | **12.00M tokens/day** |

---

## 3. Provider Quota & Entitlement Matrix

| Provider | Entitlement Class | Daily / Minute Rate Limits | Fallback Destination |
| :--- | :--- | :--- | :--- |
| **Groq** | `provider_free_quota` | High LPU speed; ~30 req/min depending on model | Cloudflare Workers AI |
| **Cloudflare Workers AI** | `provider_free_quota` | 10,000 Neurons/day allowance | Cerebras / Groq |
| **Cerebras** | `provider_free_quota` | Ultra-fast token throughput (Llama 3.1 8B) | Groq / Kiro |
| **Kiro AI** | `subscription-entitled` | Unlimited coding turns under active seat | Claude Sonnet / GLM-5 |
| **GitHub Copilot** | `subscription-entitled` | Flat monthly seat; token bursts metered | GPT-4o / GPT-4o Mini |
| **NVIDIA NIM** | `provider_free_quota` | Free developer credits (Nemotron 3.5) | OpenRouter Free |
| **OpenRouter Free** | `provider_free_quota` | 50 (unfunded) or 1,000 req/day (\$10 deposit) | Groq / Cloudflare AI |
| **Mistral AI** | `paid-token` | Metered per-token commercial API | Strictly excluded under `--free-only` |
