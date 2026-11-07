# Limitless Claude 7.0.0 Release Notes

**Release Date:** November 7, 2026  
**Codename:** Intelligent Multi-Provider Coding Router  
**Target:** Production-Grade Agentic Development Infrastructure  

---

## Executive Summary

Limitless Claude 7.0.0 transitions Limitless Claude from a static configuration wrapper into an **Intelligent Multi-Provider Coding Router**. It addresses upstream deprecation traps, eliminates token exhaustion, provides sub-second latency across primary tiers, adds profile switching, implements active circuit breakers, and introduces full observability and atomic rollback guarantees.

---

## Major Features & Enhancements

### 1. Active Fallback & Deprecation Trap Engine
* **Upstream Deprecation Trap Detection:** Intercepts HTTP 200 responses containing upstream deprecation notices (such as Google Cloud Code PA's `"This version of Antigravity is no longer supported..."`).
* **Sub-Second Rerouting:** Automatically marks the affected candidate `DEGRADED`, trips its circuit breaker immediately, and reroutes traffic to verified alternatives (Cloudflare Llama 3.3 70B Fast, Kiro Sonnet 4.5, GitHub GPT-4o).
* **Guaranteed Uptime:** Eliminates dead turns where Claude Code previously hung or aborted.

### 2. Multi-Provider Profile System
* Switch between 6 provider profiles with a single CLI command (`npm run switch-profile <name>`):
  1. `limitless`: Local OmniRoute multi-provider intelligent router (default).
  2. `native`: Official direct Anthropic API.
  3. `opencode-go`: OpenCode Go subscription coding pool.
  4. `opencode-zen`: OpenCode Zen metered gateway with budget protection.
  5. `openrouter`: OpenRouter inference hub (free :free tier and $10 credit wholesale).
  6. `antigravity`: Google One AI / Antigravity OAuth connection with deprecation safeguards.

### 3. Capability Evaluator & Granular Profiles
* Models are categorized across 7 capability profiles:
  * `FAST`: Atomic syntax edits and rapid grep (<1s response).
  * `BALANCED`: Multi-file refactors, unit tests, and feature work.
  * `REASONING`: Complex system architecture and flaw hunting.
  * `FRONTEND`: React 19, Tailwind CSS v4, and UI engineering.
  * `3D`: Three.js, React Three Fiber, GLSL shaders, and 60fps budgets.
  * `BACKEND`: Supabase migrations, PostgreSQL schemas, and REST APIs.
  * `REVIEW`: Hostile adversarial code reviews and security checks.

### 4. Billing & Quota Intelligence
* 6 distinct billing categories: `zero-marginal-cost`, `subscription-entitled`, `paid-token`, `pay-as-you-go`, `promotional`, and `local`.
* Enforce zero-charge guarantees with `--exclude-paid` or `LIMITLESS_EXCLUDE_PAID=true`.
* Real-time per-turn token cost estimations.

### 5. Circuit Breakers & Dynamic Cooldowns
* Finite state machine (`CLOSED` $\to$ `OPEN` $\to$ `HALF_OPEN`) per provider and model.
* 3-strike failure threshold for transient errors.
* Immediate trip for deprecation messages or HTTP 401/403 authorization failures.
* Exponential backoff cooldown (30s to 5m) with single-probe trial recovery.

### 6. Scoped Safe Launcher
* `npm run launcher` launches Claude Code with scoped environment variables.
* Prevents global Windows environment pollution (`setx`) and avoids cross-tool conflicts.

### 7. Terminal Observability Dashboard
* Real-time dashboard (`npm run dashboard`) displaying:
  * Active profile, gateway status, and port binding.
  * Total calls, success rate %, and p50/p95 latency percentiles.
  * Input and output token counters with estimated cost ($).
  * Combo model counts and upstream provider health table.
  * Full secret redaction on API keys, Bearer tokens, and sensitive headers.

### 8. Atomic Snapshots & Disaster Recovery Rollback
* Automatically creates WAL-safe backups of `storage.sqlite`, `~/.claude/settings.json`, and `.claude.json`.
* Instant rollback CLI (`npm run rollback -- --list` and `npm run rollback -- --latest`).

### 9. 12-Task Capability Benchmark Harness
* Automated benchmark suite (`npm run benchmark`) testing real-world agent tasks across syntax, refactoring, architecture, React 19, Three.js 3D, and PostgreSQL RLS.

---

## Live Verification & Benchmark Summary

* **Combo Verification (`npm run verify`):** **8/8 passed (0 failures)**
  * Haiku: 0.60s (HTTP 200)
  * Sonnet: 2.57s (HTTP 200)
  * Opus: 0.83s (HTTP 200)
  * Fable: 2.56s (HTTP 200)
* **Unit & Integration Tests (`npm test`):** **68/68 passed (5 suites, 0 failures)**
* **Live Benchmark Execution:**
  * Task 1 (Atomic Syntax Patch): 785ms, 100% Score (PASS)
  * Task 4 (React 19 & Tailwind Component): 2,834ms, 100% Score (PASS)
