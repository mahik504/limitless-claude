# Limitless Claude Known Issues & Constraints
*Baseline: 7.0.0 | Updated: November 2026*

---

## 1. Upstream Provider Constraints

1. **Antigravity Deprecation via OmniRoute 2.29**:
   - *Status*: RESOLVED in routing configuration.
   - *Detail*: OmniRoute 2.29 hardcoded Antigravity API version strings that Google servers deprecated. Antigravity was moved from primary to fallback in Haiku and Sonnet tiers; Kiro, Cloudflare AI, GitHub, and Mistral serve as verified primary endpoints.
2. **Benchmark Task 12 (Fullstack API) Latency / Timeout**:
   - *Status*: MITIGATED.
   - *Detail*: Task 12 evaluates multi-file fullstack implementation. On slow upstream connections, external response time can exceed default 25s timeout. Configurable timeout flag (`--timeout`) was introduced in benchmark suite.
3. **OpenRouter Rate Limits on Free Tier**:
   - *Status*: DOCUMENTED & GOVERNED.
   - *Detail*: OpenRouter provides 50 requests/day for `:free` models without a funding deposit. Depositing $10 credit unlocks 1,000 requests/day on `:free` models. Limitless Claude provides explicit token capacity calculations and rate-limit handling.
4. **Cloudflare Workers AI Daily Neurons Cap**:
   - *Status*: MANAGED.
   - *Detail*: Cloudflare free tier offers 10,000 Neurons/day (~sub-100 requests depending on model size). Fallback engines automatically step to Groq or Kiro upon HTTP 429.

---

## 2. Operational Limitations

1. **Local Gateway Dependency**:
   - OmniRoute daemon must be running locally on `127.0.0.1:20128` for live routing. `limitless doctor` and `limitless verify` report connectivity states immediately.
2. **Non-Anthropic Weight Attribution**:
   - Limitless Claude routes requests to models like Codestral, DeepSeek, Qwen, and Llama 3.3. While high-performing, these models possess distinct tokenizers, training sets, and reasoning quirks compared to proprietary Claude models. The 5-layer prompt engine mitigates these differences.
