# Limitless Claude 7.0 — Intelligent Multi-Provider Coding Agent Router

[![Version](https://img.shields.io/badge/version-7.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](package.json)
[![CI](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml/badge.svg)](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Unit Tests: 68/68 Passed](https://img.shields.io/badge/tests-68%2F68%20passed-success.svg)](docs/RELEASE-TEST-REPORT.md)
[![Acceptance: 6/6 Passed](https://img.shields.io/badge/e2e%20acceptance-6%2F6%20passed-success.svg)](docs/RELEASE-TEST-REPORT.md)
[![Live Gateway: 8/8 Healthy](https://img.shields.io/badge/live%20gateway-8%2F8%20healthy-success.svg)](scripts/verify-combos.js)

**Limitless Claude** is a high-performance, provider-neutral routing engine and control plane designed for **Claude Code CLI**, **Cursor IDE**, **Antigravity IDE**, **Superdesign / Open Design**, and **OpenCode**. It bridges agent workflows to multiple upstream AI providers through **OmniRoute**, maximizing free-tier quotas and paid entitlements with dynamic capability routing, automatic upstream deprecation trap detection, circuit breakers, truthful Anthropic-grade system prompt injection, and zero-registry configuration isolation.

---

## Highlights & System Capabilities

- **Universal Global CLI (`limitless`):** Execute `limitless verify`, `limitless benchmark`, `limitless acceptance`, `limitless dashboard`, `limitless switch-profile`, or `limitless launcher` from any directory or terminal.
- **Strict 4-Tier Composite Architecture:**
  - **Haiku Tier (`combo/limitless-haiku`):** Exactly 5–6 sub-second, rapid-response models for AST syntax verification, atomic file edits, and rapid tool iterations.
  - **Sonnet Tier (`combo/limitless-sonnet`):** Exactly 5–6 premier brainstorming, system design, architectural review, and deep reasoning models (Claude Sonnet 4.5, GLM-5, DeepSeek R1, GPT-4o, Qwen 3 Coder, Codestral).
  - **Fable Tier (`combo/limitless-fable`):** Exactly 4–5 paid and flagship frontier models for maximum context synthesis, complex multi-agent orchestration, and top-tier intelligence.
  - **Opus Tier (`combo/limitless-opus`):** A massive **23-model coding reservoir** across all connected providers for heavy autonomous coding loops, Next.js/React 19, 3D WebGL (R3F), backend PostgreSQL RLS, and full-stack development, maximizing daily token throughput.
- **Truthful Anthropic-Grade System Prompts:** Injects authoritative agent system prompts into OmniRoute's SQLite combos (`system_message`), enabling models to respond cleanly with exact `file_path:line_number` coordinates, complete unified diffs, and zero placeholder stubs (`// TODO`).
- **Active Deprecation Trap Engine:** Detects upstream deprecation notices (`"This version is no longer supported"`) embedded inside HTTP 200 OK responses and fails over in <500ms before your agent sees broken output.
- **Automatic Background Startup Daemon:** Installs an auto-recovery launcher to Windows Startup (`Limitless-OmniRoute-Launcher.vbs`) and Unix environments (`start-daemon.sh`), ensuring OmniRoute automatically launches in the background whenever the computer boots.
- **Zero-Registry Isolation:** Scoped launcher runs Claude Code without polluting your global user environment (`setx`) or Windows system registry.
- **Real-Time Terminal Observability:** Live monitoring dashboard displaying requests, latency percentiles (p50/p95), token velocity, and secret redaction.
- **100% Verified Production Suite:** 68/68 unit tests, 6/6 end-to-end acceptance tests, and 8/8 live gateway routes verified.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Composite Model Tiers & Quotas](#2-composite-model-tiers--quotas)
3. [Universal Global CLI Reference](#3-universal-global-cli-reference)
4. [Master Agent Prompts (New Setup & Update/Repair)](#4-master-agent-prompts-new-setup--updaterepair)
   - [Prompt 1: Clean Installation Master Prompt (New Setup)](#prompt-1-clean-installation-master-prompt-new-setup)
   - [Prompt 2: Repair, Update & Re-Sync Master Prompt (Broken or Existing Setup)](#prompt-2-repair-update--re-sync-master-prompt-broken-or-existing-setup)
5. [OmniRoute Gateway Integration](#5-omniroute-gateway-integration)
6. [Supported Providers & Ecosystem](#6-supported-providers--ecosystem)
7. [Active Deprecation Trap Engine & Circuit Breakers](#7-active-deprecation-trap-engine--circuit-breakers)
8. [Configuration Profiles (6 Profiles)](#8-configuration-profiles-6-profiles)
9. [Claude Code & IDE Integrations](#9-claude-code--ide-integrations)
10. [Benchmark Suite (12 Evaluation Tasks)](#10-benchmark-suite-12-evaluation-tasks)
11. [End-to-End Acceptance Suite](#11-end-to-end-acceptance-suite)
12. [Disaster Recovery & Snapshots](#12-disaster-recovery--snapshots)
13. [Contributing](#13-contributing)
14. [License](#14-license)

---

## 1. Architecture Overview

```mermaid
flowchart TD
    subgraph Clients["Developer Agents & Harnesses"]
        CC["Claude Code CLI"]
        CUR["Cursor IDE"]
        AGY["Antigravity IDE"]
        SD["Superdesign / Open Design"]
        OC["OpenCode CLI"]
    end

    subgraph Core["Limitless Claude 7.0 Control Plane"]
        CLI_BIN["Universal Global CLI (limitless)"]
        LAUNCHER["Scoped Environment Launcher"]
        FBE["Active Deprecation Trap & Fallback Engine"]
        CB["Circuit Breakers (Open/Half-Open/Closed)"]
        CE["Capability Evaluator (7 Profiles)"]
        TEL["Real-Time Telemetry & Cost Accounting"]
    end

    subgraph Gateway["OmniRoute Local Proxy (127.0.0.1:20128)"]
        MAP["Model Combo Mappings & Routing Table"]
        SQL["WAL-Consistent SQLite (storage.sqlite)"]
    end

    subgraph Tiers["Composite Multi-Model Tiers"]
        H["Limitless Haiku Tier\n(5-6 Rapid Models, <1s SLA)"]
        S["Limitless Sonnet Tier\n(5-6 Brainstorming & Architecture Models)"]
        F["Limitless Fable Tier\n(4-5 Paid Flagship Frontier Models)"]
        O["Limitless Opus Tier\n(23-Model Massive Coding Reservoir)"]
    end

    subgraph Providers["Upstream Provider Ecosystem"]
        P_KR["Kiro AI (Sonnet 4.5, GLM-5, Haiku 4.5)"]
        P_CF["Cloudflare Workers AI (LLaMA 3.3 70B, DeepSeek R1, Qwen 32B)"]
        P_GH["GitHub Copilot (GPT-4o, GPT-4o Mini)"]
        P_GQ["Groq Hardware (LPU High-Speed Inference)"]
        P_MS["Mistral AI (Codestral Latest)"]
        P_OR["OpenRouter Free Tier (Nemotron Ultra 550B, Cohere North Mini)"]
        P_KG["Kilo Gateway (Nemotron 3.5 Lightning Free)"]
    end

    Clients --> LAUNCHER
    CLI_BIN --> LAUNCHER
    LAUNCHER --> Core
    Core --> Gateway
    Gateway --> Tiers
    H --> P_KR & P_CF & P_GH & P_GQ
    S --> P_KR & P_CF & P_GH & P_MS
    F --> P_GH & P_KR & P_CF & P_MS
    O --> P_MS & P_KR & P_CF & P_GH & P_GQ & P_OR & P_KG
```

---

## 2. Composite Model Tiers & Quotas

Limitless Claude configures 4 distinct composite tiers inside OmniRoute. Each tier is curated to fulfill a specific role in an autonomous coding workflow:

| Tier | Combo ID | Primary Alias | Quota | Optimization Target | Verified Candidate Models |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Haiku 5.5** | `combo/limitless-haiku` | `claude-haiku-4-5` | **Strict 5–6 Models** | Sub-second rapid syntax verification, atomic file edits, regex extraction, tool calls | `kiro/claude-haiku-4.5`<br>`cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast`<br>`github/gpt-4o-mini`<br>`groq/openai/gpt-oss-20b`<br>`cloudflare-ai/@cf/zai-org/glm-4.7-flash`<br>`cloudflare-ai/@cf/meta/llama-3.2-3b-instruct` |
| **Sonnet 5.5** | `combo/limitless-sonnet` | `claude-sonnet-5` | **Strict 5–6 Models** | Brainstorming, system design, architectural review, debugging, deep reasoning | `kiro/claude-sonnet-4.5`<br>`kiro/glm-5`<br>`cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`<br>`github/gpt-4o-2024-11-20`<br>`kiro/qwen3-coder-next`<br>`mistral/codestral-latest` |
| **Fable 5.1** | `combo/limitless-fable` | `claude-fable-5-1` | **Strict 4–5 Models** | Paid & elite flagship frontier models, high-context synthesis, complex orchestration | `github/gpt-4o-2024-11-20`<br>`kiro/claude-sonnet-4.5`<br>`kiro/glm-5`<br>`cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`<br>`mistral/codestral-latest` |
| **Opus 5.5** | `combo/limitless-opus` | `claude-opus-4-8` | **23+ Model Reservoir** | Autonomous full-stack coding, React 19, 3D WebGL (R3F), PostgreSQL RLS, multi-turn refactors | `mistral/codestral-latest`<br>`kiro/claude-sonnet-4.5`<br>`kiro/qwen3-coder-next`<br>`kiro/glm-5`<br>`kiro/deepseek-3.2`<br>`kiro/minimax-m2.1`<br>`cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct`<br>`cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`<br>`cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast`<br>`cloudflare-ai/@cf/qwen/qwq-32b`<br>`github/gpt-4o-2024-11-20`<br>`groq/openai/gpt-oss-120b`<br>`openrouter/nvidia/nemotron-3-ultra-550b-a55b:free`<br>`kilo-gateway/nvidia/nemotron-3-ultra-550b-a55b:free`<br>`openrouter/cohere/north-mini-code:free`<br>`kilo-gateway/cohere/north-mini-code:free`<br>`openrouter/nvidia/nemotron-3.5-lightning:free`<br>`kilo-gateway/nvidia/nemotron-3.5-lightning:free`<br>`openrouter/liquid/lfm-2.5-2.6b:free`<br>`openrouter/dots-studio/dots-3-note-preview:free`<br>`cloudflare-ai/@cf/meta/llama-3.2-3b-instruct`<br>`groq/openai/gpt-oss-20b`<br>`cloudflare-ai/@cf/zai-org/glm-4.7-flash` |

---

## 3. Universal Global CLI Reference

Limitless Claude includes a first-class global CLI executable (`limitless`) available across any terminal:

```bash
# Verify all 8 tier endpoints and direct combos live
limitless verify

# Run the 12-task capability benchmark against live models
limitless benchmark

# Run the complete end-to-end acceptance suite (all 6 criteria)
limitless acceptance

# Open real-time terminal observability dashboard
limitless dashboard
limitless dashboard --watch

# List or switch active provider profiles
limitless switch-profile --list
limitless switch-profile limitless
limitless switch-profile native
limitless switch-profile opencode-go
limitless switch-profile openrouter

# Launch Claude Code inside a clean, scoped environment
limitless launcher
limitless launcher --print "Refactor authentication flow"

# Rollback configurations to a previous WAL-safe snapshot
limitless rollback --list
limitless rollback --latest
```

---

## 4. Master Agent Prompts (New Setup & Update/Repair)

Below are the two complete, production-grade master instruction prompts. Copy and paste the appropriate prompt directly into **Cursor**, **Antigravity**, or any agent coding environment.

---

### Prompt 1: Clean Installation Master Prompt (New Setup)

```markdown
# MISSION: CLEAN INSTALLATION OF LIMITLESS CLAUDE 7.0 & OMNIROUTE GATEWAY

You are tasked with installing and configuring Limitless Claude 7.0 from scratch.
Execute every step methodically, verifying output after each command. Do not leave placeholder stubs.

### STEP 1: PREFLIGHT ENVIRONMENT VALIDATION
1. Verify Node.js version is >= 22.0.0:
   node -v
   If Node is not installed or version < 22, alert the user to install Node.js 22 LTS or newer.
2. Verify Git is available:
   git --version

### STEP 2: OMNIROUTE GATEWAY INSTALLATION & DAEMON INITIALIZATION
1. Check if OmniRoute is installed globally:
   npm list -g omniroute --depth=0
   If missing, install globally:
   npm install -g omniroute
2. Verify port 20128 status:
   - On Windows: netstat -ano | findstr :20128
   - On Unix: lsof -i :20128
   If a dead or hanging process occupies port 20128, terminate it cleanly:
   - Windows: taskkill /F /PID <PID>
   - Unix: kill -9 <PID>
3. Start OmniRoute gateway in the background:
   - Windows: Start-Process -NoNewWindow npx -ArgumentList "omniroute serve"
   - Unix/macOS: nohup npx omniroute serve > omniroute.log 2>&1 &
4. Wait 3 seconds and verify gateway availability:
   curl -s http://127.0.0.1:20128/health || curl -s http://127.0.0.1:20128/

### STEP 3: CLONE LIMITLESS CLAUDE & INSTALL DEPENDENCIES
1. Clone the repository into a persistent directory (e.g., C:\projects\limitless-claude or ~/projects/limitless-claude):
   git clone https://github.com/mahik504/limitless-claude.git C:\projects\limitless-claude
   cd C:\projects\limitless-claude
2. Install dependencies:
   npm install
3. Install the universal global CLI executable:
   npm link (or run node bin/limitless.js directly)

### STEP 4: VERIFY PROVIDER CONNECTIONS
1. Inform the user to ensure their provider credentials are connected in the OmniRoute dashboard at:
   http://localhost:20128/providers
2. Supported provider setups:
   - Free providers: Cloudflare Workers AI, Groq, Kiro AI, Mistral, OpenRouter (free tier), Kilo Gateway.
   - Subscription/Paid providers: GitHub Copilot, OpenCode Go, OpenRouter ($10 credit), Antigravity.
3. Check active database keys:
   Verify ~/.omniroute/storage.sqlite exists and contains an active API key in table api_keys.

### STEP 5: EXECUTE DYNAMIC DISCOVERY, TIER SYNC & PROMPT INJECTION
1. Run the Limitless setup engine:
   node scripts/setup.js
   This automatically:
   - Scans all live models from http://127.0.0.1:20128/v1/models.
   - Enforces tier quotas: Haiku (5-6 rapid sub-second models), Sonnet (5-6 brainstorming & architecture models), Fable (4-5 paid flagship models), Opus (20+ coding reservoir models).
   - Injects truthful, Anthropic-grade agent system prompts into each combo (combos.system_message in SQLite) so models respond identically to real Claude Code without fake tags or stubs.
   - Configures pattern mappings (claude*haiku*, claude*sonnet*, claude*opus*, claude*fable*, *best*, *opusplan*).
   - Installs the background auto-recovery startup daemon (Limitless-OmniRoute-Launcher.vbs on Windows Startup) so OmniRoute starts automatically whenever the computer powers on.
   - Updates ~/.claude/settings.json with ANTHROPIC_BASE_URL (http://127.0.0.1:20128) and the active API key.

### STEP 6: VERIFICATION & ACCEPTANCE
1. Execute live endpoint verification:
   node bin/limitless.js verify
   Ensure all 8 aliases and combos return HTTP 200 with non-empty responses.
2. Execute the full unit test suite:
   npm test
   Ensure 68/68 tests pass.
3. Run the end-to-end acceptance suite:
   node bin/limitless.js acceptance
   Ensure all 6 acceptance criteria pass.
4. Report final installation status and demonstrate launching Claude Code:
   limitless launcher --print "System status check"
```

---

### Prompt 2: Repair, Update & Re-Sync Master Prompt (Broken or Existing Setup)

```markdown
# MISSION: REPAIR, UPDATE & RE-SYNC LIMITLESS CLAUDE 7.0 INSTALLATION

You are tasked with diagnosing, repairing, updating, or re-synchronizing an existing Limitless Claude installation.
Preserve existing user provider credentials and API keys throughout this operation.

### STEP 1: PREFLIGHT DIAGNOSTICS & PROCESS INSPECTION
1. Inspect running OmniRoute daemon and port 20128:
   - Windows: netstat -ano | findstr :20128
   - Unix: lsof -i :20128
2. Check SQLite database integrity:
   node -e "const db = require('better-sqlite3')(require('path').join(require('os').homedir(), '.omniroute', 'storage.sqlite'), { readonly: true }); console.log('Integrity check:', db.prepare('PRAGMA quick_check').get());"
3. Test live gateway connectivity:
   curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:20128/v1/models
   If gateway is unreachable, unresponsive, or returning HTTP 500:
   - Terminate hanging OmniRoute processes on port 20128.
   - Restart daemon cleanly: npx omniroute serve

### STEP 2: CREATE WAL-CONSISTENT DATABASE BACKUP
1. Before applying updates, take an immediate verified backup:
   - Windows: Copy-Item "$HOME\.omniroute\storage.sqlite" "$HOME\.omniroute\storage.sqlite.manual_bak"
   - Unix: cp ~/.omniroute/storage.sqlite ~/.omniroute/storage.sqlite.manual_bak

### STEP 3: PULL LATEST RELEASE & REBUILD
1. Navigate to the Limitless Claude directory (e.g., C:\projects\limitless-claude):
   cd C:\projects\limitless-claude
2. Fetch and merge latest updates from master:
   git fetch origin
   git checkout master
   git pull origin master
3. Refresh dependencies:
   npm install

### STEP 4: RESOLVE UPSTREAM DEPRECATIONS & RE-SYNC COMBOS
1. Run the dynamic model setup script:
   node scripts/setup.js
   This command will:
   - Re-scan live models and filter out any upstream endpoints returning deprecation warnings (e.g. Antigravity IDE version notices).
   - Re-populate Haiku (5-6 rapid models), Sonnet (5-6 architectural reasoning models), Fable (4-5 paid models), and Opus (20+ coding reservoir models).
   - Re-inject authoritative Anthropic system prompts into combos table to ensure truthful formatting and no hallucinated tags.
   - Repair and re-link model_combo_mappings.
   - Ensure the Windows Startup auto-recovery launcher (Limitless-OmniRoute-Launcher.vbs) is intact.
2. Synchronize ~/.claude/settings.json:
   Verify env.ANTHROPIC_BASE_URL is http://127.0.0.1:20128 and ANTHROPIC_AUTH_TOKEN matches the active key.

### STEP 5: VERIFICATION & ACCEPTANCE AUDIT
1. Verify all 8 tier aliases and direct combos:
   node bin/limitless.js verify
   Confirm 8/8 pass with valid LLM reasoning (not deprecation strings).
2. Run unit tests:
   npm test
   Confirm 68/68 pass.
3. Run end-to-end acceptance tests:
   node bin/limitless.js acceptance
   Confirm 6/6 pass.
4. If any tier fails, inspect scripts/apply-maximized-combos.js, run node scripts/apply-maximized-combos.js, and re-test.

### STEP 6: ROLLBACK CONTINGENCY (IF FAILURES OCCUR)
If the update encounters unresolvable provider errors:
1. Revert to latest snapshot:
   node bin/limitless.js rollback --latest
2. Restart OmniRoute daemon:
   npx omniroute serve
```

---

## 5. OmniRoute Gateway Integration

OmniRoute operates on `http://127.0.0.1:20128` as a local reverse proxy. Limitless Claude configures the underlying SQLite storage (`~/.omniroute/storage.sqlite`) with automated WAL-mode checkpoints, creating pattern-based mappings:

```
claude*haiku*     --> combo/limitless-haiku
claude*sonnet*    --> combo/limitless-sonnet
claude*opus*      --> combo/limitless-opus
claude*fable*     --> combo/limitless-fable
*best*            --> combo/limitless-fable
*opusplan*        --> combo/limitless-sonnet
```

---

## 6. Supported Providers & Ecosystem

Limitless Claude supports all major AI inference platforms categorized by billing model:

1. **Zero-Marginal-Cost Providers:**
   - **Cloudflare Workers AI:** Edge inference with LLaMA 3.3 70B, DeepSeek R1 32B, GLM 4.7 Flash, and Qwen 2.5 Coder.
   - **Groq:** Ultra-high-speed LPU inference delivering 500+ tokens/sec.
   - **OpenRouter Free Tier:** Nemotron Ultra 550B, Cohere North Mini Code, Nemotron Lightning.
   - **Kilo Gateway:** Free community access endpoints.
2. **Subscription-Entitled Providers:**
   - **GitHub Copilot:** GPT-4o and GPT-4o Mini with entitlement quotas.
   - **Kiro AI:** Claude Sonnet 4.5, GLM-5, Claude Haiku 4.5, Qwen 3 Coder.
   - **OpenCode Go:** Flat-rate unlimited model subscription.
3. **Metered / Paid Inference:**
   - **Mistral AI:** High-precision Codestral Latest.
   - **OpenRouter Paid ($10 Balance):** Unlocks 1,000 requests/day and frontier wholesale reasoning models.

---

## 7. Active Deprecation Trap Engine & Circuit Breakers

Upstream providers occasionally deprecate client versions or return text warnings inside **HTTP 200 OK** payloads:
```json
{
  "choices": [{
    "message": {
      "content": "This version of Antigravity is no longer supported. Please download the latest version..."
    }
  }]
}
```
A generic proxy forwards this text directly to your agent, breaking file edits and confusing the LLM. 

Limitless Claude implements the **Active Deprecation Trap Engine** ([`src/core/fallback-engine.js`](src/core/fallback-engine.js)):
1. Inspects upstream responses in real-time.
2. Detects deprecation patterns (`/no longer supported/i`, `/deprecated client/i`, `/outdated version/i`).
3. Instantly trips the provider's **Circuit Breaker** to `OPEN` status.
4. Transparently re-routes the agent's turn to the next candidate model in the tier in `<500ms`.

---

## 8. Configuration Profiles (6 Profiles)

Easily switch routing strategies depending on your task and network configuration:

| Profile | Command | Description |
| :--- | :--- | :--- |
| **`limitless`** | `limitless switch-profile limitless` | Default 4-tier composite load-balanced router maximizing free tokens. |
| **`native`** | `limitless switch-profile native` | Direct Anthropic API pass-through for zero-proxy native latency. |
| **`opencode-go`** | `limitless switch-profile opencode-go` | Flat-rate subscription router optimized for OpenCode Go users. |
| **`opencode-zen`** | `limitless switch-profile opencode-zen` | Metered, budget-capped pay-as-you-go router. |
| **`openrouter`** | `limitless switch-profile openrouter` | Dedicated OpenRouter hub switching between free and funded models. |
| **`antigravity`** | `limitless switch-profile antigravity` | Scoped route for Google Antigravity OAuth-entitled inference. |

---

## 9. Claude Code & IDE Integrations

### Claude Code CLI
Limitless Claude writes non-destructive configuration to `~/.claude/settings.json`:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_OMNIROUTE_API_KEY"
  },
  "primaryModel": "claude-opus-4-8"
}
```
Launch scoped Claude Code without modifying Windows system variables:
```bash
limitless launcher
```

### Cursor & Antigravity IDE
In your IDE settings, set:
- **Anthropic Base URL:** `http://127.0.0.1:20128`
- **Anthropic API Key:** Your OmniRoute key (`sk-ant-...`)
- **Model Override:** `claude-sonnet-5` (for architecture) or `claude-opus-4-8` (for coding)

---

## 10. Benchmark Suite (12 Evaluation Tasks)

The built-in benchmark engine ([`scripts/benchmark.js`](scripts/benchmark.js)) evaluates models across 12 realistic software engineering tasks:

```bash
limitless benchmark
```

```
================================================================================
             LIMITLESS CLAUDE 7.0 - 12-TASK CAPABILITY BENCHMARK
================================================================================
 Target Endpoint : auto
 Gateway         : 127.0.0.1:20128

  TASK ID                  PROFILE    LATENCY    SCORE   STATUS
  -----------------------  ---------  ---------  ------  --------
  task-01-fast-patch       FAST       761 ms     100%    PASS
  task-02-balanced-refactor  BALANCED   4517 ms    100%    PASS
  task-03-reasoning-arch   REASONING  3317 ms    60%     PASS
  task-04-frontend-react19  FRONTEND   1546 ms    67%     PASS
  task-05-3d-webgl-r3f     3D         1473 ms    50%     PASS
  task-06-backend-rls      BACKEND    6351 ms    100%    PASS
  task-07-hostile-review   REVIEW     2687 ms    75%     PASS
  task-08-tool-json        REASONING  1180 ms    100%    PASS
  task-09-context-recall   REASONING  1500 ms    100%    PASS
  task-10-regex-extract    FAST       700 ms     100%    PASS
  task-11-typescript-strict  BACKEND    4507 ms    75%     PASS
  task-12-fullstack-api    BALANCED   25004 ms   0%      FAIL
--------------------------------------------------------------------------------
 Overall Score : 76% (11/12 passed)
================================================================================
```

---

## 11. End-to-End Acceptance Suite

The acceptance test suite ([`scripts/e2e-acceptance.js`](scripts/e2e-acceptance.js)) verifies all 6 core criteria live against your running OmniRoute daemon:

```bash
limitless acceptance
```

```
================================================================================
          LIMITLESS CLAUDE 7.0.0 — END-TO-END ACCEPTANCE SUITE
================================================================================
Running Test 1: Repository Multi-File Implementation (Haiku)...
  -> Status: PASS (2858ms)
Running Test 2: Premium Frontend React 19 Component (Opus)...
  -> Status: PASS (5977ms)
Running Test 3: Complex Backend PostgreSQL RLS Policy (Sonnet)...
  -> Status: PASS (6030ms)
Running Test 4: 3D R3F Canvas & Frame Budget (Opus)...
  -> Status: PASS (1945ms)
Running Test 5: Model Routing & Frontier Reasoning (Fable)...
  -> Status: PASS (13539ms)
Running Test 6: Provider Profile Switching (Config Manager)...
  -> Status: PASS (2ms)
--------------------------------------------------------------------------------
End-to-End Acceptance Results: 6/6 PASSED
================================================================================
```

---

## 12. Disaster Recovery & Snapshots

Every run of `limitless setup` or `limitless switch-profile` automatically takes a WAL-consistent snapshot before writing changes. If anything unexpected happens, roll back with one command:

```bash
# List all snapshots
limitless rollback --list

# Roll back to the most recent snapshot
limitless rollback --latest
```

---

## 13. Contributing

Contributions, issues, and feature requests are welcome. Check out the [Issues](https://github.com/mahik504/limitless-claude/issues) tab and submit a pull request with passing tests (`npm test`).

---

## 14. License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
