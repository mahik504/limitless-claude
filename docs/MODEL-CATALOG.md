# Limitless Claude Model Catalog

This document details the exact candidates configured in Limitless Claude's internal routing tiers. 

> **Important**: This is the *hard-coded candidate list*. The `setup.js` script dynamically filters this list against your live OmniRoute inventory. If you do not have a provider authenticated, its models are safely skipped and will not be added to your tier.

---

## 1. Haiku Tier (Speed)
*Intended for rapid lookups, syntax fixes, and low-latency edits.*
* **Strategy**: Priority Cascade

1. `github/gpt-4o-mini`
2. `antigravity/gemini-3.1-flash-lite`
3. `kiro/qwen3-coder-next`
4. `groq/llama-3.1-8b-instant`
5. `openrouter/z-ai/glm-5.2:free`
6. `openrouter/qwen/qwen3.8-27b:free`
7. `openrouter/nvidia/nemotron-3.5-lightning:free`

---

## 2. Sonnet Tier (Reasoning)
*Intended for system design, architecture planning, and complex debugging.*
* **Strategy**: Priority Cascade

1. `antigravity/claude-sonnet-4-6`
2. `bluesminds/deepseek-reasoner`
3. `antigravity/claude-opus-4-6-thinking`
4. `github/gpt-4o-2024-11-20`
5. `kiro/glm-5`
6. `huggingchat/CohereLabs/command-a-reasoning-08-2025`

---

## 3. Opus Tier (Coding Reservoir)
*Intended as the main workhorse for massive raw code generation and multi-agent loops.*
* **Strategy**: Round-Robin (Load-Balanced)

1. `kiro/qwen3-coder-next`
2. `mistral/codestral-latest`
3. `kiro/deepseek-3.2`
4. `openrouter/z-ai/glm-5.2:free`
5. `openrouter/qwen/qwen3.8-27b:free`
6. `openrouter/poolside/laguna-s-2.1:free`
7. `bluesminds/gpt-5.5`
8. `ollama-cloud/glm-5.3`
9. `bluesminds/kimi-k3`
10. `kiro/glm-5`
11. `openrouter/liquid/lfm-2.5-2.6b:free`
12. `huggingchat/deepseek-ai/DeepSeek-V4-Pro`
13. `huggingchat/Qwen/Qwen3.6-27B`
14. `opencode/deepseek-v4-flash-free`
15. `opencode/big-pickle`
16. `muse-spark-web/muse-spark-thinking`
17. `muse-spark-web/muse-spark`

---

## 4. Fable Tier (Premium God-Mode)
*Intended for complex context synthesis leveraging your paid subscriptions and premium entitlements.*
* **Strategy**: Round-Robin (Load-Balanced)

1. `github/gpt-4o-2024-11-20`
2. `antigravity/claude-opus-4-6-thinking`
3. `antigravity/gemini-3.1-pro-low`
4. `openrouter/moonshotai/kimi-k3`
5. `openrouter/z-ai/glm-5.3`
6. `openrouter/qwen/qwen-3.8-coder-32b-instruct`

---

## How to Check Your Actual Configuration
Because the setup script dynamically filters the above candidates, your actual active configuration is written to a generated JSON file during setup. 

To view the exact models that successfully mapped to your active providers, inspect:
`config/tier-configuration.json`
