# Supported Provider Ecosystem (Limitless Claude 7.0)

Limitless Claude 7.0 relies on the local **OmniRoute** gateway to normalize connections across commercial, subscription, community, and local AI providers. This document outlines the supported provider ecosystem, billing classes, rate limit handling, and failover mechanics.

---

## 1. Provider Access & Billing Classes

Every provider connection is categorized by [`src/core/billing-classifier.js`](file:///C:/projects/limitless-claude/src/core/billing-classifier.js):

### A. Zero-Marginal-Cost Providers (`zero-marginal-cost`)
Free developer endpoints that incur zero per-token charges:
* **Cloudflare Workers AI (`cloudflare-ai`)**: Ultra-low-latency edge inference (<1s SLA) for `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `@cf/qwen/qwen2.5-coder-32b-instruct`, and `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`.
* **Kilo Gateway (`kilo-gateway`)**: Free community endpoints including `nvidia/nemotron-3.5-lightning:free` and `cohere/north-mini-code:free`.
* **OpenRouter Free Tier (`openrouter/*:free`)**: Free open-weight endpoints. With a $10 deposited balance, daily limits expand from 50 to 1,000 requests/day.
* **Groq (`groq`)**: LPU inference engine for rapid syntax verification and atomic diffs.
* **Ollama Cloud (`ollama-cloud`)**: Cloud-hosted developer endpoints for large MoE models.

### B. Subscription-Entitled Providers (`subscription-entitled`)
Inference covered by flat monthly developer subscriptions:
* **GitHub Models (`github`)**: Covered by your GitHub Copilot seat, granting access to `gpt-4o`, `gpt-4o-mini`, and `gpt-4o-2024-11-20`.
* **Kiro AI (`kiro`)**: High-performance models including `claude-sonnet-4.5`, `glm-5`, `qwen3-coder-next`, and `deepseek-3.2`.
* **OpenCode Go (`opencode-go`)**: Flat-rate coding subscription covering unlimited/high-quota Claude and frontier models.
* **Antigravity (`antigravity`)**: Google One AI / OAuth-based models (`gemini-2.5-pro`, `gemini-2.5-flash`) protected by active deprecation trap checks.

### C. Metered Paid Inference Providers (`paid-token` / `pay-as-you-go`)
Chargeable token endpoints used with strict safety controls:
* **Mistral AI (`mistral`)**: Pay-per-token API for `codestral-latest` ($0.30/M input, $0.90/M output).
* **OpenCode Zen (`opencode-zen`)**: Pay-as-you-go router tier with explicit per-turn budget metering.
* **OpenRouter Paid Models (`openrouter`)**: Direct wholesale model inference for frontier LLMs.

---

## 2. Dynamic Circuit Breakers & Cooldowns

Limitless Claude 7.0 actively monitors every provider's health via [`src/core/routing-policy.js`](file:///C:/projects/limitless-claude/src/core/routing-policy.js):
1. **Consecutive Failure Threshold:** 3 failures automatically trip a provider's circuit breaker to `OPEN`.
2. **Immediate Trip Events:** Upstream deprecation notices ("version no longer supported") or HTTP 401/403 authorization failures trip immediately without waiting for 3 attempts.
3. **Exponential Cooldown:** Base wait time of 30s doubles on each successive trip up to a 5-minute maximum.
4. **Half-Open Recovery:** When cooldown expires, the breaker enters `HALF_OPEN` and permits a single probe. If successful, it resets to `CLOSED`.

---

## 3. Provider Profiles in Limitless Claude 7.0

Switch active provider profiles without modifying shell or system files:
```bash
# Switch to OpenCode Go subscription
npm run switch-profile opencode-go

# Switch to OpenRouter gateway
npm run switch-profile openrouter

# Switch back to local Limitless multi-provider combos
npm run switch-profile limitless
```

---

## 4. Provider Authentication & Setup

1. Launch OmniRoute:
   ```bash
   omniroute serve
   ```
2. Navigate to `http://localhost:20128/providers`.
3. Click **Connect** for your providers (GitHub, Kiro, Cloudflare, OpenRouter, Mistral, etc.).
4. Run setup to update active combos:
   ```bash
   npm run setup
   ```
5. Verify live routing:
   ```bash
   npm run verify
   ```
