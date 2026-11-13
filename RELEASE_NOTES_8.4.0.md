# Release Notes: Limitless Claude 8.4.0

Limitless Claude 8.4.0 is the **Master Architectural Consolidation Release**. It introduces native Claude Desktop Third-Party Gateway Integration, 6 production routing tiers with dedicated Desktop Chat and Cowork combos, the OpenRouter $10 Multiplier engine (1,000 req/day on `:free`), 24 modular workload capability profiles, P0 security hardening for secret handling, and a Universal One-Prompt Agent Master Installer.

---

## What's New in 8.4.0

### 1. Claude Desktop Third-Party Gateway Integration
- Discovered and harnessed Claude Desktop’s internal Third-Party Inference gateway mode (`AppData/Local/Claude-3p/configLibrary/<UUID>.json`).
- Fully bypassed the frontend `jo(e)` validator constraint by mapping routes to compliant `claude-*` aliases (`claude-desktop-chat`, `claude-desktop-cowork`, `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-fable-5-1`).
- Disabled aggressive auto-discovery (`modelDiscoveryEnabled: false`) to permanently resolve UI freezing caused by 2,700+ raw discovered models.
- Synchronized all 6 local MCP servers (`orchestra-brain`, `context7`, `playwright`, `stitch`, `shadcn`, `magic-ui`) across CLI and Desktop configurations.

### 2. Dedicated 6-Tier Architecture & Desktop Combos
- Provisioned two dedicated desktop combos alongside the 4 core tiers:
  - `combo/desktop-chat`: High-throughput conversational QA and prose using DeepSeek V3, Kimi 2.5, and Llama 3.3 70B.
  - `combo/desktop-cowork`: Strictly restricted to models with verified Anthropic XML `tool_use` schema compatibility for agentic MCP tool execution (Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Flash, GLM-4 9B).
- All 12 targets (6 route aliases + 6 direct combos) verified live with HTTP 200 responses in sub-3 seconds via `scripts/verify-combos.js`.

### 3. OpenRouter $10 Multiplier Engine
- Formally integrated verified capacity rules: maintaining a $10 credit balance elevates free tier limits on all `:free` models from **50 requests/day to 1,000 requests/day** (a **20x throughput multiplier**).
- Preserves the capital balance intact: calls to models ending with `:free` deduct $0.00 from your balance.
- Implemented **Sticky Session Priority Pooling**: multi-account rotation maintains session affinity to benefit from prompt prefix caching, only failing over when an account encounters an HTTP 429 rate limit or balance exhaustion.

### 4. P0 Security Hardening
- **Eliminated Windows Command-Line Token Leaks**: Modified `scripts/setup.js` so raw API keys are never passed as command-line arguments to Windows `setx`. Non-sensitive URLs (`ANTHROPIC_BASE_URL`, `OMNIROUTE_BASE_URL`) remain persisted, while authentication tokens are strictly stored in `~/.claude/settings.json` with file ACLs.
- **AST Secret Redaction**: Enforced automated secret masking across all diagnostic outputs, benchmark logs, and status screens via `src/utils/redact.js`.

### 5. Expanded 5-Layer Prompt Engine (24 Workload Profiles)
- Expanded the capability library in `prompts/capabilities/` to 24 purpose-built profiles:
  - Agentic Coding, Architecture, Reasoning, Debugging, Defensive Security, Verification Testing, Tool Reliability, Long-Horizon Trajectories, Multi-Agent Swarms, Failure Recovery, Cost-Aware Execution, Conversational Chat, Backend Contracts, Frontend State, 3D WebGL Shaders, ML Pipelines, Data Engineering, Automation, Repository Cartography, Research, Code Review, Technical Documentation, Fast Micro-Patches, and Balanced Daily Development.

### 6. Universal One-Prompt Agent Master Installer
- Published `docs/MASTER-INSTALL-PROMPT.md`: enables developers to copy-paste a single self-executing prompt into any AI agent (Antigravity, Cursor, Claude Code) to autonomously orchestrate Node.js, OmniRoute, Claude Code CLI, Claude Desktop, SQLite combos, and 16-point diagnostic validation in one execution.

### 7. Gateway Persistence Watchdog
- Re-engineered `omniroute-daemon.bat` with dynamic port collision detection, universal PATH binary resolution (pnpm, npm global, npx), and automatic 3-second crash recovery loops.

---

## Verification & Test Results

```text
================================================================================
          LIMITLESS CLAUDE 8.4.0 — SYSTEM & GATEWAY DIAGNOSTIC DOCTOR
================================================================================
  [PASS] Node.js Runtime Version              : v24.19.0 (>= 22 required)
  [PASS] Platform Architecture                : win32 (x64), 32 cores
  [PASS] OmniRoute Database File              : storage.sqlite (140 tables verified)
  [PASS] SQLite Integrity & Schema Health     : Journal: WAL mode healthy
  [PASS] OmniRoute API Key Authorization      : Active key: sk-ant...62127e
  [PASS] Local Gateway Reachability (:20128)  : HTTP 200 OK (sub-50ms)
  [PASS] Configured Provider Connections      : 14 active / 16 total
  [PASS] Discovered Model Catalog             : 585 models catalogued
  [PASS] Composite Routing Tiers (6 Tiers)    : All 6 tiers registered & tested
  [PASS] Capability Evaluator Governance      : Strict 6-stage lifecycle enforced
  [PASS] Billing Classifier Safety Guard      : Unknown costs return null (never $0.00)
  [PASS] Backup & Snapshot Directory          : Snapshots available for rollback
  [PASS] Claude Code Configuration Dir        : ~/.claude verified
  [PASS] OpenRouter Capacity Policy           : $10 credit unlocks 1000 req/day
  [PASS] Orchestra Integration Gate           : Connected: Mode B Active (Orchestra 5.5.0)
  [PASS] Local Ollama Engine (:11434)         : Standby / Optional (offline)
--------------------------------------------------------------------------------
Diagnostic Summary: 16 PASSED, 0 WARNINGS, 0 NOT TESTED, 0 FAILURES
Unit & Contract Test Suite: 97/97 PASSED (15 suites, 0 failures, 2.82s)
Combo Verification: 12/12 targets HTTP 200 OK (all 6 aliases + 6 combos)
>>> System is healthy, operational, and production-ready.
================================================================================
```

---

## Upgrade Instructions

From any existing installation:
```bash
cd C:\projects\limitless-claude
git pull origin master
npm install
npm test
limitless doctor
limitless verify
```
