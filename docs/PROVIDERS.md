# Supported Provider Ecosystem

Limitless Claude relies on the upstream **OmniRoute** gateway to normalize connections to various AI providers. This document outlines the providers explicitly targeted by our configured candidates and their access categories.

## 1. Zero-Marginal-Cost Providers
These providers offer significant free tiers that do not require monthly subscriptions or per-token billing, making them ideal for the heavy load-balancing in the **Opus** and **Haiku** tiers.

* **OpenRouter** (`openrouter`): Offers an extensive library of `:free` models (e.g., Qwen, DeepSeek, GLM, Llama). A funded account ($10 minimum balance) unlocks a massive 1,000 requests/day limit.
* **HuggingChat** (`huggingchat`): Provides free access to large, open-weight models (Command R, DeepSeek Pro) via web authentication.
* **Groq** (`groq`): Provides exceptionally fast inference for Llama 3 models with generous daily quotas.
* **Ollama Cloud** (`ollama-cloud`): Free, community-hosted endpoints for open-weight models.
* **Muse Spark** (`muse-spark-web`): Experimental web-based provider.

## 2. Subscription-Entitled Providers
These providers are accessed via flat monthly subscriptions you may already possess. Using them incurs zero per-token inference charges, but their total volume is capped by the subscription's internal limits.

* **GitHub Copilot** (`github`): Authenticated via your GitHub Copilot subscription, granting access to premium models like `gpt-4o`.
* **Antigravity** (`antigravity`): Authenticated via the Antigravity IDE, granting generous daily access to Claude, Gemini, and Opus configurations.
* **BluesMinds** (`bluesminds`): Provides reasoning-focused APIs.
* **Kiro** (`kiro`): High-quality coding models (Qwen Coder, DeepSeek) bundled within their subscription access.

## 3. Paid Inference Providers
These providers charge per-token. Limitless Claude uses them sparingly, primarily reserving them for the **Fable Tier** or explicit complex queries where open-weight models might struggle.

* **Mistral** (`mistral`): Direct API access for `codestral-latest`.
* **OpenRouter (Paid Models)** (`openrouter`): When explicitly configuring non-`:free` models (e.g., `qwen-3.8-coder-32b-instruct`), standard OpenRouter per-token pricing applies.

---

## Ecosystem Mechanics
If you only connect 3 out of the 10 supported providers in your OmniRoute dashboard, Limitless Claude handles this gracefully. The `setup.js` script queries your active OmniRoute session and filters out any candidate model whose provider is not currently authenticated. 

*Nothing breaks. The active tiers simply become smaller.*
