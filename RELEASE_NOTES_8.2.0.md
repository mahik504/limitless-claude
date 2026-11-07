# Release Notes: Limitless Claude 8.2.0

Limitless Claude 8.2.0 adds an interactive terminal TUI dashboard, real-time token and cost savings telemetry, local Ollama auto-discovery, full Orchestra 4.5.0 workflow synchronization, and complete npm package distribution readiness.

---

## What's New in 8.2.0

### 1. Interactive Terminal TUI Dashboard (`limitless tui`)
- Full-screen terminal dashboard displaying gateway reachability, round-trip latency, active profile, local Ollama status, 4 composite tiers, live token counters, and active task pins.
- Interactive hotkeys: `r` to refresh, `s` to view full statistics, `p` to view pins, and `q` to exit.
- Clean ANSI borders and non-blocking polling suitable for continuous background monitoring.

### 2. Live Token & Cost Savings Telemetry (`limitless stats`, `limitless tokens`)
- Aggregates live token metrics directly from OmniRoute SQLite database (`call_logs` and `daily_usage_summary`).
- Tracks total requests, prompt tokens, completion tokens, reasoning tokens, and tier distribution percentages.
- Computes estimated commercial dollar value and cost savings compared to direct Anthropic API list pricing ($0.25/$1.25 Haiku, $3.00/$15.00 Sonnet, $15.00/$75.00 Opus).

### 3. Local Ollama Auto-Discovery Engine
- Built-in probing module (`src/core/ollama-discovery.js`) that detects local Ollama inference instances running on `http://127.0.0.1:11434`.
- Fast 1.2-second non-blocking probe that falls back cleanly when offline.
- Discovered local models (`qwen2.5-coder:32b`, `deepseek-r1:14b`, `llama3.3:latest`) are automatically inventoried with `billing: free` and `lifecycle: stable` for zero-cost, private offline coding.

### 4. Orchestra 4.5.0 Full-Workflow Integration & CLI
- Upgraded adapter (`src/integrations/orchestra/adapter.js`) to support Orchestra 4.5.0 task specifications and skill classifications.
- Added `limitless orchestra status` to verify local workspace root, version parity, Claude Code adapter state, and skill parity.
- Added `limitless orchestra sync` to automatically synchronize `CLAUDE.md` and skills from `C:\projects\orchestra-workflow\skills` into `~/.claude/`.

### 5. NPM Package Distribution Readiness
- Configured `package.json` for global distribution (`npm i -g limitless-claude` or `npm link`).
- Clean `files` whitelist ensuring zero build artifacts, test databases, or logs in published tarballs.
- Added `prepack` script enforcing that all 95 tests pass before packaging.

---

## Verification & Test Results

```text
Unit & Contract Tests (`npm test`)        : 95/95 passed (15 suites)
System Diagnostic Doctor (`limitless doctor`): 16/16 passed (Orchestra 4.5.0 Mode B Active)
Tier Connectivity (`limitless verify`)     : 8/8 routes HTTP 200 OK
End-to-End Acceptance (`limitless acceptance`): 6/6 passed
Prompt Laboratory (`limitless prompt test`) : 4/4 fixtures passed (100% score)
Local Ollama Discovery                     : Verified online probe & offline fallback
Token & Savings Telemetry                  : 4.57M tokens tracked ($14.59 - $72.96 value saved)
```

---

## Upgrade Guide

To upgrade an existing installation:

```bash
cd C:\projects\limitless-claude
git pull origin master
npm install
npm link
limitless doctor
limitless orchestra sync
limitless verify
```
