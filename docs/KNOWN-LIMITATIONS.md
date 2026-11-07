# Limitless Claude 7.0.0 — Known Limitations & Non-Blocking Backlog

This document provides a transparent list of known technical constraints, upstream provider quirks, and non-blocking backlog items for Limitless Claude 7.0.0.

---

## 1. Upstream Provider Idiosyncrasies

### A. Google Cloud Code / Antigravity Deprecation Traps
- **Issue:** Google's `cloudcode-pa.googleapis.com` PA proxy returns HTTP 200 containing `"This version of Antigravity is no longer supported..."` on certain model endpoints (`gemini-3.5-flash-lite`, `claude-opus-4-6-thinking`).
- **Mitigation:** In Limitless Claude 7.0.0, candidate ordering places verified healthy models (`cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `kiro/claude-sonnet-4.5`) at index 0. The `FallbackEngine` actively traps any deprecation string and trips the circuit breaker to route around it in <500ms.

### B. OpenRouter Free-Tier Rate Limits
- **Issue:** Accounts without funded balances are capped at 50 requests per day across free models (`:free`).
- **Mitigation:** Depositing a $10 credit balance increases the rate limit to 1,000 requests per day and unlocks wholesale model routing.

### C. Cursor IDE Custom Model GUI
- **Issue:** Cursor's graphical "Custom Model" configuration panel exhibits intermittent header normalization issues when connecting to third-party Anthropic proxies.
- **Mitigation:** Verified and recommended workflow is running Claude Code inside Cursor's integrated terminal (`Ctrl + \`` or `Cmd + \``) via `npm run launcher`.

---

## 2. Configuration & Environment Constraints

### A. Scoped Launchers vs. Global Variables
- **Constraint:** Using `npm run launcher` scopes `ANTHROPIC_BASE_URL` exclusively to the spawned Claude Code child process. Opening a separate standard terminal without using `launcher.js` requires either setting `ANTHROPIC_BASE_URL` in `~/.claude/settings.json` or running `npm run switch-profile limitless`.

### B. Billing Classification Heuristics
- **Constraint:** Model classification is based on verified provider lists and model suffixes (`:free`). While highly accurate, upstream providers may alter pricing terms; developers should periodically check provider dashboards.

---

## 3. Non-Blocking Backlog Items (P2 / P3)

* **[P2] Automated Key Rotation:** Support multiple API keys per provider in round-robin sequence to multiply free-tier request limits.
* **[P3] Web GUI Observability Dashboard:** An optional browser-based companion dashboard on `http://localhost:20128/limitless` supplementing the terminal dashboard.
* **[P3] Upstream Latency Prediction:** Pre-dispatch latency estimation using moving averages from recent call logs.
