# Supported Provider Ecosystem

Limitless Claude relies on the local **OmniRoute** gateway to normalize connections to various third-party AI providers. This document outlines the providers explicitly targeted by our configured candidates and their access classes.

---

## 1. Provider Access Classes

### A. Zero-Marginal-Cost Providers (ZMC)
These providers offer free tiers or community endpoints that do not require monthly subscription fees or metered per-token billing:

* **OpenRouter (`:free` endpoints)**: Offers an extensive pool of free open-weight models (Qwen, DeepSeek, GLM, Llama). A funded account ($10 deposit) expands the free model rate limit to 1,000 requests/day.
* **Groq (`groq`)**: Provides exceptionally fast inference for Llama 3 models with generous daily quotas (up to 14,400 RPD).
* **HuggingChat (`huggingchat`)**: Provides access to open-weight models (Command R, DeepSeek) via web authentication.
* **Ollama Cloud (`ollama-cloud`)**: Free, community-hosted endpoints for open-weight models.
* **OpenCode (`opencode`)**: Free developer model endpoints.
* **Muse Spark (`muse-spark-web`)**: Experimental web endpoints.

### B. Subscription-Entitled Providers (SUB)
These providers are accessed via flat monthly developer subscriptions you already possess. Using them incurs zero additional per-token charges, but total volume is constrained by the provider's subscription limits:

* **GitHub Copilot (`github`)**: Authenticated via your GitHub Copilot subscription, granting access to models like `gpt-4o` and `gpt-4o-mini`.
* **Antigravity (`antigravity`)**: Authenticated via your Antigravity IDE environment, granting daily access to Claude and Gemini model profiles.
* **BluesMinds (`bluesminds`)**: Provides developer reasoning APIs under account subscription.
* **Kiro (`kiro`)**: High-performance coding models (Qwen Coder, DeepSeek) bundled within their subscription access.

### C. Metered Paid Inference Providers (PAID)
These providers charge per token. Limitless Claude uses them sparingly, primarily within the **Fable Tier** or explicit complex queries:

* **Mistral (`mistral`)**: Direct API access for `codestral-latest`.
* **OpenRouter (Paid Models) (`openrouter`)**: Non-`:free` models (such as `qwen-3.8-coder-32b-instruct` or `moonshotai/kimi-k3`) incur standard OpenRouter token charges.

---

## 2. Dynamic Filtering Mechanics

If you only connect 3 out of the 10 supported providers in your OmniRoute dashboard, Limitless Claude handles this gracefully:
- The setup script (`scripts/setup.js`) queries your active OmniRoute providers and skips any candidate model whose provider is not authenticated.
- The remaining candidates are preserved in their exact priority order.
- The active configuration is saved to `config/tier-configuration.json` along with billing class annotations.

---

## 3. Provider Authentication Guidance

1. Start OmniRoute:
   ```bash
   omniroute serve
   ```
2. Open your browser to `http://localhost:20128`.
3. In the left navigation, click **Providers**.
4. Click **Connect** for each provider you have credentials for (e.g., GitHub, OpenRouter, Groq).
5. Run `npm run setup` in this repository to synchronize your new provider connections into Limitless Claude combos.
