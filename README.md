# Limitless Claude 8.5 🔥💀

[![Version](https://img.shields.io/badge/version-8.5.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](package.json)
[![CI](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml/badge.svg)](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests: 100% Passing](https://img.shields.io/badge/tests-97%2F97%20passed-success.svg)](test/)
[![Acceptance: 6/6 Passed](https://img.shields.io/badge/e2e%20acceptance-6%2F6%20passed-success.svg)](scripts/e2e-acceptance.js)
[![Diagnostics: 16/16 Healthy](https://img.shields.io/badge/doctor-16%2F16%20healthy-success.svg)](scripts/doctor.js)

> **Limitless Claude** is the production-grade developer control plane, policy companion, and multi-provider compatibility ecosystem built around the modern Claude experience. Operating directly above a local **OmniRoute** inference gateway (`http://127.0.0.1:20128`), Limitless Claude liberates developers from vendor lock-in, arbitrary rate limits, and runaway token costs—connecting Claude Code CLI, Claude Desktop, VS Code, Cursor, and Antigravity to over 580 models across 16 global providers with sub-second failover.

---

## Table of Contents

1. [Our Vision & Mission](#our-vision--mission)
2. [What's New in v8.5.0](#whats-new-in-v850)
3. [What's New in v8.4.0](#whats-new-in-v840)
3. [How Limitless Claude Works](#how-limitless-claude-works)
4. [Master Architectural Design Diagrams](#master-architectural-design-diagrams)
   - [System Topology Architecture](#1-system-topology-architecture)
   - [Internal Control Plane Component Design](#2-internal-control-plane-component-design)
   - [End-to-End Request, Streaming & Failover Sequence](#3-end-to-end-request-streaming--failover-sequence)
   - [Claude Desktop Third-Party Gateway Architecture](#4-claude-desktop-third-party-gateway-architecture)
5. [In-Depth Competitor Comparison Matrix](#in-depth-competitor-comparison-matrix)
6. [The 6 Production Routing Tiers & Combos](#the-6-production-routing-tiers--combos)
7. [5-Layer Modular Prompt Engine & 24 Workload Profiles](#5-layer-modular-prompt-engine--24-workload-profiles)
8. [Provider Strategy & The OpenRouter $10 Multiplier](#provider-strategy--the-openrouter-10-multiplier)
9. [Universal One-Prompt Agent Master Installer](#universal-one-prompt-agent-master-installer)
10. [End-to-End Installation & Automatic Startup](#end-to-end-installation--automatic-startup)
    - [OmniRoute Persistent Daemon & Auto-Start](#1-omniroute-persistent-daemon--auto-start)
    - [Claude Code CLI Setup](#2-claude-code-cli-setup)
    - [Claude Desktop Third-Party Inference Setup](#3-claude-desktop-third-party-inference-setup)
    - [IDE Integrations (VS Code, Cursor, Antigravity)](#4-ide-integrations-vs-code-cursor-antigravity)
11. [Autonomous Diagnostics & Self-Healing Matrix](#autonomous-diagnostics--self-healing-matrix)
12. [Reusable AI Agent Prompts Index](#reusable-ai-agent-prompts-index)
13. [CLI Command Reference](#cli-command-reference)
14. [Verification Sign-Off & Test Results](#verification-sign-off--test-results)
15. [Releases & Changelog](#releases--changelog)

---

## Our Vision & Mission

Modern AI-assisted engineering has hit a paradox: while the tooling (Claude Code, Claude Desktop, Cursor) has become extraordinarily capable, developers are constrained by artificial API monopolies, sudden usage limits, single-provider outages, and astronomical "frontier taxes" for routine syntactic tasks.

**Our Vision is Total Provider Independence without Workflow Compromise:**
- **Zero Friction**: Your native workflows in Claude Code CLI and Claude Desktop remain 100% identical. You run `claude`, use normal slash commands, and invoke tools without changing habits.
- **Economic Sanity**: Never pay $15/M tokens to fix a missing semicolon. Sub-second models handle mechanical refactoring, while frontier intelligence is preserved for architectural design.
- **Fail-Safe Reliability**: When an upstream provider returns an HTTP 429 rate limit or goes offline, your agent session does not crash. OmniRoute and Limitless Claude cascade to the next healthy model in under 500ms.
- **Uncompromising Security**: Zero secret leakage. No raw API tokens exposed in Windows event logs, shell histories, or process tables.

---

## What's New in v8.5.0 🔥💀

Limitless Claude v8.5.0 is the **High-Performance Priority Routing & Desktop Integration Release**:

1. **Multi-Turn Priority Routing Architecture 🔥**:
   - Fixed the root cause of 4-5 minute conversation freezes by migrating all 6 combos from round-robin to strict priority routing (`strategy: "priority"`).
   - Fast primary models (`kiro/claude-sonnet-4.5`, `kiro/claude-haiku-4.5`, `github/gpt-4o-2024-11-20`, `mistral/codestral-latest`) are pinned at priority index 0.
   - Purged slow or broken endpoints (`kiro/deepseek-3.2` with 150s timeouts, `xkiro/mistralai/mistral-large-2512` with HTTP 403, and `gemma-4-31b-it` with 110s timeouts) from combos and dynamic classification.
   - Multi-turn conversation turns now respond in 1.4s to 3.5s per turn with zero freezing.

2. **Claude Desktop 119 Skills & Manifest Synchronization 🔥**:
   - Enabled `skillScanningEnabled: true` in Claude Desktop configuration (`AppData/Local/Claude-3p/configLibrary/<UUID>.json`), eliminating `appShippedOnly` skill blocking.
   - Copied 119 Orchestra Workflow skills into the Desktop skills directory and indexed full metadata in `manifest.json`.
   - Registered `claude-desktop` as a valid sync host in `C:\projects\orchestra-workflow\registries\host-dirs.json`.

3. **Official Anthropic System Prompts & Identity Guardrails 💀**:
   - Injected official Anthropic Claude cognitive directives, artifacts rules, and Orchestra 5.5.0 instructions into Claude Desktop `organizationInstructions` and OmniRoute combo system messages.
   - Prevents model persona leakage ("created by Mistral", "I'm Kiro") and enforces Zero-Stub production code standards.

4. **Clean UTF-8 Environment 💀**:
   - Repaired UTF-16LE null-byte corruption in `~/.omniroute/.env`.

5. **In-Depth Comparison: Limitless Claude vs. Raw Claude Code / Codex CLI 🔥💀**:
   - Raw tools lock developers to a single proprietary provider with strict token limits and sudden 429 crashes. Limitless Claude offers 100% free multi-provider routing across 580+ models, sub-second priority failovers, 119 Orchestra skills, and unified compatibility across Claude Code CLI, Claude Desktop, and IDEs.

6. **What We Provide For Free 🔥**:
   - Complete free access to Claude Code CLI, Claude Desktop (Chat & Cowork), and IDE extensions through OmniRouter combos.

7. **Honest Technical Acknowledgment & Disclaimer 💀**:
   - Limitless Claude does not possess proprietary Anthropic server-side weights, but combines top frontier models with official cognitive directives to deliver the closest free equivalent with superior resilience.

---

## What's New in v8.4.0

Limitless Claude v8.4.0 represents our most significant architectural leap to date:

1. **Dedicated Claude Desktop Third-Party Inference Integration**:
   - Discovered and harnessed Claude Desktop’s internal `configLibrary` gateway mode.
   - Bypassed the frontend `jo(e)` validator constraint using compliant `claude-*` alias mappings.
   - Disabled aggressive auto-discovery (`modelDiscoveryEnabled: false`) to eliminate UI freezing from 2,700+ discovered models.
   - Provisioned dedicated `combo/desktop-chat` (creative high-speed prose) and `combo/desktop-cowork` (strict Anthropic `tool_use` compatibility).

2. **The OpenRouter $10 Multiplier Engine**:
   - Integrated the verified $10 lifetime deposit policy: elevates `:free` model limits from **50 requests/day to 1,000 requests/day** (a 20x throughput increase) with zero deduction from your deposit pool.

3. **P0 Security Hardening**:
   - Completely eliminated raw credential passing via Windows `setx` in [scripts/setup.js](scripts/setup.js).
   - Authenticated tokens are restricted strictly to `~/.claude/settings.json` with file ACLs, preventing exposure in Sysmon and Windows Event Log (Event ID 4688).
   - Standardized token masking across all outputs using [src/utils/redact.js](src/utils/redact.js).

4. **Expanded 5-Layer Prompt Engine (24 Specialized Workload Profiles)**:
   - Expanded capability profiles in [prompts/capabilities/](prompts/capabilities/) from 12 to 24 profiles, adding dedicated agents for Security Auditing, ML Development, 3D WebGL, Multi-Agent Swarms, and Tool Reliability.

5. **Universal One-Prompt Agent Installer**:
   - Created [docs/MASTER-INSTALL-PROMPT.md](docs/MASTER-INSTALL-PROMPT.md) enabling developers to paste a single instruction block into any AI agent (Antigravity, Cursor, Claude Code) to configure Node.js, OmniRoute, Claude Code, Claude Desktop, and all combos autonomously.

6. **Automated Gateway Persistence & Watchdog**:
   - Re-engineered [omniroute-daemon.bat](omniroute-daemon.bat) and [start-daemon.sh](start-daemon.sh) with port collision detection, universal PATH binary resolution, and auto-restart crash loops.

---

## How Limitless Claude Works

Limitless Claude operates on a strict **Separation of Policy and Data Transport**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPER CLIENTS                               │
│        Claude Code CLI · Claude Desktop · VS Code · Cursor             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Anthropic Messages API Protocol
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LIMITLESS CLAUDE (Policy Plane)                      │
│  - 5-Layer Prompt Engine (prompts/capabilities/)                       │
│  - Task-to-Model Pinning Engine (src/core/task-pins.js)                │
│  - Granular File Undo Checkpoints (src/core/file-checkpoint.js)        │
│  - Secret Redaction Utility (src/utils/redact.js)                      │
│  - Three-Layer Financial Accounting (src/core/token-tracker.js)        │
│  - Diagnostic Doctor (scripts/doctor.js)                               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Enriched System Instructions & Routing
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   OMNIRUTE GATEWAY (Data Transport)                    │
│  - HTTP & SSE Streaming Server (:20128)                                │
│  - Anthropic Messages ↔ OpenAI Completions Protocol Normalizer         │
│  - Circuit Breaker FSM (Closed / Open / Half-Open)                     │
│  - SQLite Storage Engine (storage.sqlite - WAL Mode)                   │
│  - Multi-Account Connection Pooling & Failover Scheduler               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Cascading Upstream Inference
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      UPSTREAM INFERENCE POOL                           │
│   Kiro AI · Cloudflare Workers AI · GitHub Models · OpenRouter         │
│   Groq Cloud · Mistral AI · NVIDIA NIM · Local Ollama (:11434)         │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Policy vs. Transport**: Limitless Claude never acts as a redundant network proxy. Instead, it audits, configures, and monitors **OmniRoute**, which handles socket I/O, streaming token translation, and provider connection pooling.
2. **Transparent Interception**: Clients point their `ANTHROPIC_BASE_URL` to `http://127.0.0.1:20128`. The gateway dynamically translates Anthropic tool-use schemas into OpenAI format when dispatching to non-Anthropic models, and normalizes the response back into native Anthropic SSE chunks.
3. **Deterministic Failover**: If a primary upstream fails (HTTP 429, 500, or network drop), OmniRoute immediately trips its circuit breaker and routes the request to Candidate #2 within 350ms, without dropping the developer's terminal connection.

---

## Master Architectural Design Diagrams

### 1. System Topology Architecture

```mermaid
graph TD
    subgraph ClientLayer["Developer Client Environments"]
        CLI["Claude Code CLI (v2.1.310 / v2.1.322)"]
        Desk["Claude Desktop (Third-Party Inference Mode)"]
        VSC["VS Code (anthropic.claude-code Extension)"]
        Cur["Cursor IDE (Terminal / Background Proxy)"]
        AGY["Antigravity IDE (Workspace Harness)"]
    end

    subgraph PolicyLayer["Limitless Claude 8.4 Policy Control Plane"]
        PE["5-Layer Prompt Engine (24 Profiles)"]
        Pins["Task-to-Model Pinning Engine"]
        Undo["File Checkpoint & Undo Engine"]
        Doctor["16-Point Diagnostic Doctor"]
        Redact["Zero-Exposure Secret Redactor"]
        Telemetry["Three-Layer Financial Tracker"]
    end

    subgraph DataLayer["OmniRoute Inference Gateway (127.0.0.1:20128)"]
        Router["Combo Strategy Router (Priority / Round-Robin)"]
        CB["Circuit Breaker FSM Engine"]
        Translator["Anthropic ↔ OpenAI Protocol Normalizer"]
        DB[("storage.sqlite (140 Tables, WAL Mode)")]
    end

    subgraph UpstreamLayer["Configured Upstream Providers (585+ Models)"]
        Kiro["Kiro AI (Sonnet, Opus, GLM-5, Qwen)"]
        CF["Cloudflare Workers AI (Zero-Cost Models)"]
        GH["GitHub Copilot / Models (GPT-4o, Mini)"]
        OR["OpenRouter (Funded $10 / 1000 req/day Tier)"]
        Groq["Groq Cloud (Sub-second Llama 3.3)"]
        Mis["Mistral AI (Codestral, Mistral Large)"]
        Oll["Local Ollama (127.0.0.1:11434 - Standby)"]
    end

    ClientLayer -->|Anthropic Messages API| DataLayer
    PolicyLayer -->|Configures Rules & Pins| ClientLayer
    PolicyLayer -->|Audits & Provisions Combos| DB
    DataLayer <--> DB
    DataLayer --> Router
    Router --> Translator
    Translator --> CB
    CB --> UpstreamLayer
```

### 2. Internal Control Plane Component Design

```mermaid
classDiagram
    class PromptEngine {
        +composePrompt(options)
        +loadCapability(workload)
        +injectConstitution()
        +sanitizeDelimiters()
    }
    class TaskPinManager {
        +setPin(task, model)
        +getPin(task)
        +removePin(task)
        +listPins()
    }
    class FileCheckpointManager {
        +createCheckpoint(files, label)
        +restoreCheckpoint(id, dryRun)
        +listCheckpoints()
    }
    class SecretRedactor {
        +maskKey(key, showEnds)
        +redactText(text)
        +redactObject(obj)
    }
    class BillingClassifier {
        +classify(modelId)
        +isFreeTier(modelId)
        +getEstimatedCost(modelId)
    }
    class DiagnosticDoctor {
        +runAllChecks()
        +verifyDatabaseHealth()
        +verifyGateway()
        +verifyKeyPermissions()
    }

    PromptEngine --> SecretRedactor
    DiagnosticDoctor --> BillingClassifier
    DiagnosticDoctor --> SecretRedactor
    TaskPinManager --> PromptEngine
```

### 3. End-to-End Request, Streaming & Failover Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Client as Claude Client (CLI / Desktop)
    participant LC as Limitless Claude Policy
    participant GW as OmniRoute Gateway (:20128)
    participant CB as Circuit Breaker
    participant P1 as Upstream Provider 1 (Primary)
    participant P2 as Upstream Provider 2 (Fallback)

    Dev->>Client: "Refactor database connection pool"
    Client->>LC: Intercept task & apply active task-pin (if set)
    LC->>LC: Compose 5-layer prompt & redact sensitive tokens
    Client->>GW: POST /v1/messages (Model: claude-sonnet-5-5, Stream: true)
    GW->>GW: Match alias -> combo/limitless-sonnet
    GW->>CB: Check Candidate #1 health
    alt Circuit is Healthy (CLOSED)
        GW->>P1: Forward request (Streaming SSE)
        alt Upstream 1 Throttles (HTTP 429)
            P1-->>GW: HTTP 429 Rate Limit Exceeded
            GW->>CB: Trip breaker (OPEN) for Candidate #1
            GW->>P2: Instant fallback to Candidate #2
            P2-->>GW: HTTP 200 OK (Stream SSE tokens)
            GW-->>Client: Normalized Anthropic SSE chunks
            Client-->>Dev: Real-time code streams without error
        else Upstream 1 Responds OK
            P1-->>GW: HTTP 200 OK (Stream SSE tokens)
            GW-->>Client: Normalized Anthropic SSE chunks
            Client-->>Dev: Real-time code streams
        end
    end
    Client->>LC: Post-execution telemetry
    LC->>LC: Compute token volume & Anthropic cost savings
```

### 4. Claude Desktop Third-Party Gateway Architecture

```mermaid
graph LR
    subgraph ClaudeDesktopApp["Claude Desktop App (Electron)"]
        UI["Conversational UI / Cowork View"]
        Validator["Frontend Model Validator (jo(e) Regex)"]
        ConfigLib["configLibrary/<UUID>.json"]
    end

    subgraph OmniRoute["OmniRoute Local Server (:20128)"]
        Aliases["Alias Mappings (*desktop-chat*, *desktop-cowork*)"]
        ChatCombo["combo/desktop-chat (Speed & Prose)"]
        CoworkCombo["combo/desktop-cowork (Strict Tool Use)"]
    end

    subgraph MCPServers["Synchronized MCP Servers"]
        Brain["orchestra-brain"]
        Stitch["stitch"]
        Play["playwright"]
        Ctx["context7"]
    end

    UI --> Validator
    Validator -->|Matches 'claude-*'| ConfigLib
    ConfigLib -->|Routes inference to localhost:20128| Aliases
    Aliases --> ChatCombo
    Aliases --> CoworkCombo
    UI <--> MCPServers
    CoworkCombo <-->|Anthropic XML tool_use| MCPServers
```

---

## In-Depth Competitor Comparison Matrix

| Capability / Metric | Native Claude Code | OpenAI Codex CLI | Google Gemini CLI | Hermes Agent | Aider | Cline / Roo | LiteLLM Proxy | LIMITLESS CLAUDE 8.4 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Multi-Provider Cascading** | [None] | [None] | [None] | [Basic] | [Manual] | [Per-Task] | [Yes] | **🔥 Sub-second Automatic** |
| **Claude Desktop Support** | [None] | [None] | [None] | [None] | [None] | [None] | [Manual] | **🔥 Native 3p Gateway** |
| **Sub-Model Task Pinning** | [None] | [None] | [None] | [None] | [None] | [None] | [None] | **🔥 `limitless pin`** |
| **Granular File Checkpoints** | [Git only] | [Git only] | [None] | [None] | [Git-based] | [Checkpoints] | [None] | **🔥 `limitless undo`** |
| **5-Layer AST Prompt Engine** | [Monolith] | [Static] | [Static] | [Prompts] | [Static] | [System] | [None] | **🔥 24 Modular Profiles** |
| **RTK Token Killer Hooks** | [None] | [None] | [None] | [None] | [Repomap] | [None] | [None] | **🔥 Slashing 90% logs** |
| **Zero-Exposure Redaction** | [Plaintext] | [Plaintext] | [Plaintext] | [None] | [Plaintext] | [Partial] | [Partial] | **🔥 AST & Process Safe** |
| **Anthropic Cost Telemetry** | [Billing] | [None] | [None] | [None] | [Run est.] | [Run est.] | [DB only] | **🔥 3-Layer Accounting** |
| **OpenRouter $10 Multiplier** | [None] | [None] | [None] | [None] | [None] | [None] | [None] | **🔥 1,000 req/day `:free`**|
| **Multi-Account Rotation** | [None] | [None] | [None] | [None] | [None] | [None] | [Random] | **🔥 Sticky Session Affinity**|
| **External Harness Interop** | [None] | [None] | [None] | [None] | [None] | [None] | [None] | **🔥 Mode A / Mode B** |

---

## The 6 Production Routing Tiers & Combos

Limitless Claude configures 6 dedicated composite tiers inside `storage.sqlite`, each optimized with custom fallback priorities and routing algorithms:

```
┌─────────────────────────┬──────────────┬──────────────┬──────────────────────────────┬──────────────────────────┐
│ Tier / Combo Name       │ Route Alias  │ Strategy     │ Primary Models & Fallbacks   │ Target Workload          │
├─────────────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────┤
│ combo/limitless-haiku   │ claude-haiku │ Round-Robin  │ llama-3.3-70b-versatile,     │ Sub-second linting,      │
│                         │              │              │ deepseek-v3, mistral-small,  │ quick syntax fixes, docs,│
│                         │              │              │ gpt-4o-mini                  │ AST micro-patches        │
├─────────────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────┤
│ combo/limitless-sonnet  │ claude-sonnet│ Round-Robin  │ claude-sonnet-4.5, gpt-4o,   │ Architectural planning,  │
│                         │              │              │ deepseek-coder-v2.5, qwen-72b│ complex multi-file edits │
├─────────────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────┤
│ combo/limitless-opus    │ claude-opus  │ Round-Robin  │ 24 verified frontier coding  │ Deep reasoning, security │
│                         │              │              │ reservoir models             │ audits, difficult bugs   │
├─────────────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────┤
│ combo/limitless-fable   │ claude-fable │ Priority     │ gemini-2.5-flash, gpt-4o,    │ Complex long-horizon     │
│                         │              │              │ codestral-2501, kimi-2.5     │ research and synthesis   │
├─────────────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────┤
│ combo/desktop-chat      │ claude-chat  │ Priority     │ deepseek-v3, kimi-2.5,       │ Interactive Claude       │
│                         │              │              │ llama-3.3-70b, qwen-2.5-72b  │ Desktop conversational QA│
├─────────────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────┤
│ combo/desktop-cowork    │ claude-cowork│ Priority     │ claude-sonnet-4.5, gpt-4o,   │ Claude Desktop Cowork +  │
│                         │              │              │ gemini-2.5-flash, glm-4-9b   │ Local MCP Tool Calling   │
└─────────────────────────┴──────────────┴──────────────┴──────────────────────────────┴──────────────────────────┘
```

---

## 5-Layer Modular Prompt Engine & 24 Workload Profiles

Located in [src/core/prompt-engine.js](src/core/prompt-engine.js), the Prompt Engine synthesizes five orthogonal instruction layers at runtime, ensuring models adhere to strict engineering standards without polluting conversation context:

- **Layer 1: Universal Engineering Constitution**: Non-negotiable principles—mandatory inspection before editing, zero TODO stubs or truncated placeholder code, atomic commits, and verification gates before completion claims.
- **Layer 2: Environment Adaptation**: Specific protocol directives matching Claude Code CLI, Claude Desktop, Cursor, or VS Code.
- **Layer 3: Provider Syntax Adapters**: Formatting requirements for specific model families (e.g. DeepSeek `<think>` reasoning tags, Anthropic XML tags, Qwen markdown blocks).
- **Layer 4: Modular Workload Profiles**: 24 purpose-built profiles loaded dynamically from [prompts/capabilities/](prompts/capabilities/):
  1. `agentic-coding.md` — Multi-step autonomous coding, atomic edits, test-first iteration.
  2. `architecture.md` — Domain modeling, bounded contexts, system decomposition.
  3. `reasoning.md` — Formal hypothesis testing, root-cause isolation.
  4. `debugging.md` — Systematic defect reproduction, regression tests.
  5. `security.md` — Defensive architecture, OWASP Top 10 mitigation, zero secret leaks.
  6. `verification-testing.md` — Evidence-first rule: execute before claiming completion.
  7. `tool-reliability.md` — Strict JSON schema compliance, resilient tool handling.
  8. `long-horizon.md` — State preservation across multi-session trajectories.
  9. `multi-agent.md` — Swarm patterns, task handoffs, and coordinator roles.
  10. `failure-recovery.md` — Rollback procedures, dealing with degraded providers.
  11. `cost-aware.md` — Token conservation, RTK output slashing, context compaction.
  12. `chat.md` — Direct prose, structural clarity, zero conversational filler.
  13. `backend.md` — API contracts, Zod schemas, database connection pooling.
  14. `frontend.md` — Component lifecycles, state isolation, web performance.
  15. `3d.md` — WebGL, Three.js shaders, frame budget management.
  16. `aiml-development.md` — Model training loops, PyTorch/TensorFlow pipelines.
  17. `data-engineering.md` — Streaming pipelines, schema validation, batch ETL.
  18. `automation.md` — CI/CD workflows, background tasks, cron routines.
  19. `repo-investigation.md` — Codebase cartography, import graph tracing.
  20. `research.md` — Primary source synthesis, empirical verification.
  21. `review.md` — Rigorous code review, anti-pattern detection.
  22. `documentation.md` — Technical API references, developer tutorials.
  23. `fast.md` — High-throughput micro-patches with sub-second SLA.
  24. `balanced.md` — Daily balanced engineering profile.
- **Layer 5: Active Task Pins & Telemetry**: Current task pinning overrides and counterfactual financial savings metrics.

---

## Provider Strategy & The OpenRouter $10 Multiplier

### The $10 Credit Multiplier Rule
OpenRouter imposes severe rate limits on free accounts:
- **Unfunded Accounts ($0.00 Balance)**: Limited to 50 requests/day across all free models, with aggressive queuing and 60-second timeouts.
- **Funded Accounts (≥$10 Lifetime Deposit)**: Unlocks **1,000 requests/day** on all `:free` models (a **20x throughput multiplier**) and routes through high-priority inference queues.
- **Preserved Capital**: The $10 is an account credit balance, not a subscription fee. When routing to models ending with `:free` (e.g. `meta-llama/llama-3.3-70b-instruct:free`), **$0.00 is deducted from your balance**.

### Multi-Account Rotation & Sticky Session Affinity
OmniRoute natively handles multiple accounts for the same provider (e.g. personal and team Kiro or Antigravity accounts) using **Sticky Session Affinity**:
- Calls within an ongoing trajectory remain bound to the same account to benefit from prompt prefix caching.
- If an account encounters an HTTP 429 rate limit or quota exhaustion, OmniRoute marks it in a 120-second cooldown and seamlessly shifts traffic to the backup account.

---

## Universal One-Prompt Agent Master Installer

Want to install and configure the entire Limitless Claude ecosystem in one shot? Simply copy and paste the instruction block below directly into your AI coding agent (Antigravity, Cursor, Claude Code, etc.):

```markdown
Run the Limitless Claude Universal Setup on this machine:
1. Verify Node.js >= 22 and Git are installed.
2. Ensure OmniRoute is installed (`npm i -g omniroute`) and launch the persistent background daemon via `omniroute-daemon.bat` (or `nohup omniroute serve &`).
3. Clone https://github.com/mahik504/limitless-claude to `C:\projects\limitless-claude` (or `~/limitless-claude`), install dependencies, and run `npm link`.
4. Configure `~/.claude/settings.json` with ANTHROPIC_BASE_URL="http://127.0.0.1:20128" and an active API key from the OmniRoute database.
5. In Claude Desktop (`AppData/Local/Claude-3p/configLibrary`), set modelDiscoveryEnabled=false, configure inference endpoints for the 6 tiers (claude-desktop-chat, claude-desktop-cowork, claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5, claude-fable-5-1), and synchronize all local MCP servers.
6. Populate all 6 model combos in OmniRoute SQLite database.
7. Run `limitless doctor` and confirm all 16 diagnostic checks pass with 0 failures.
```

---

## End-to-End Installation & Automatic Startup

### 1. OmniRoute Persistent Daemon & Auto-Start

OmniRoute must listen on `http://127.0.0.1:20128`.

#### Windows Persistent Watchdog
Use the included [omniroute-daemon.bat](omniroute-daemon.bat), which automatically detects running instances, resolves the binary, and restarts on crash:
```cmd
C:\projects\limitless-claude\omniroute-daemon.bat
```

To configure automatic startup on Windows login:
1. Press `Win + R`, type `shell:startup`, and press Enter.
2. Create a shortcut to `C:\projects\limitless-claude\omniroute-daemon.bat` inside that folder.

#### Linux / macOS Systemd Daemon
Create `/etc/systemd/system/omniroute.service`:
```ini
[Unit]
Description=OmniRoute Local Inference Gateway
After=network.target

[Service]
Type=simple
User=%I
ExecStart=/usr/bin/env npx omniroute serve
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now omniroute
```

### 2. Claude Code CLI Setup

1. Install Claude Code CLI:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
2. Configure `~/.claude/settings.json`:
   ```json
   {
     "env": {
       "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128",
       "ANTHROPIC_AUTH_TOKEN": "sk-ant-your-omniroute-token"
     },
     "model": "claude-sonnet-5-5",
     "modelSettings": {
       "claude-opus-5-5": { "effortLevel": "xhigh" },
       "claude-sonnet-5-5": { "effortLevel": "high" },
       "claude-haiku-5-5": { "effortLevel": "low" }
     }
   }
   ```
3. Launch Claude Code:
   ```bash
   claude
   ```

### 3. Claude Desktop Third-Party Inference Setup

1. Open `%LOCALAPPDATA%\Claude-3p\configLibrary\<UUID>.json`.
2. Disable model discovery to prevent UI freezing:
   ```json
   "modelDiscoveryEnabled": false
   ```
3. Add the 6 validated routes to `inferenceModels`:
   ```json
   {
     "id": "claude-desktop-chat",
     "displayName": "Limitless Chat (DeepSeek V3 / Kimi)",
     "description": "High-speed conversational QA and prose"
   },
   {
     "id": "claude-desktop-cowork",
     "displayName": "Limitless Cowork (Claude Sonnet / GPT-4o)",
     "description": "Agentic pair-programming with MCP tool execution"
   },
   {
     "id": "claude-sonnet-5-5",
     "displayName": "Limitless Sonnet (Architecture)",
     "description": "Deep architectural reasoning"
   },
   {
     "id": "claude-opus-5-5",
     "displayName": "Limitless Opus (Frontier Coding)",
     "description": "End-to-end coding reservoir"
   },
   {
     "id": "claude-haiku-5-5",
     "displayName": "Limitless Haiku (Sub-second)",
     "description": "Ultra-fast micro repairs"
   },
   {
     "id": "claude-fable-5-1",
     "displayName": "Limitless Fable (Flagship)",
     "description": "Complex research and formal verification"
   }
   ```
4. Synchronize all MCP servers in `%APPDATA%\Claude\claude_desktop_config.json`.

### 4. IDE Integrations (VS Code, Cursor, Antigravity)

*   **VS Code**: Add to `%APPDATA%\Code\User\settings.json`:
    ```json
    "claudeCode.environmentVariables": [
      { "name": "ANTHROPIC_BASE_URL", "value": "http://127.0.0.1:20128" },
      { "name": "ANTHROPIC_AUTH_TOKEN", "value": "sk-ant-your-omniroute-token" }
    ],
    "claudeCode.disableLoginPrompt": true
    ```
*   **Cursor**: Open integrated terminal (`Ctrl+\``) and run `claude` or `limitless launcher`.
*   **Antigravity**: MCP tools and terminal execution seamlessly hook into the local OmniRoute gateway.

---

## Autonomous Diagnostics & Self-Healing Matrix

Run the 16-point diagnostic suite anytime:
```bash
limitless doctor
```

| Symptom / Failure | Root Cause | Automated Self-Healing Action |
| :--- | :--- | :--- |
| **HTTP 401 Unauthorized** | Token mismatch or missing combo permissions in SQLite | Run `limitless setup --repair-permissions` to re-authorize active key. |
| **Claude Desktop UI Freezes** | `modelDiscoveryEnabled: true` floods UI with 2,700+ models | Set `"modelDiscoveryEnabled": false` in `Claude-3p/configLibrary/<UUID>.json`. |
| **Model Rejected by Claude Desktop** | Model ID does not match `claude-*` regex | Map model alias through `claude-desktop-chat` or `claude-desktop-cowork`. |
| **SQLite `database is locked`** | WAL checkpoint pending or busy process | Run `limitless rollback --checkpoint` to force atomic WAL checkpoint. |
| **HTTP 429 Rate Limits** | Upstream provider tier exhaustion | OmniRoute automatically trips circuit breaker and switches to Candidate #2. |
| **Accidental Bad Edit in Agent Loop** | Hallucinated code or broken test suite | Execute `limitless undo` to revert files to the pre-edit snapshot. |

---

## Reusable AI Agent Prompts Index

Detailed instructions and operational guides are organized in [docs/](docs/):

| Prompt / Guide | File Path | Scope & Usage |
| :--- | :--- | :--- |
| **Master Install Prompt** | [`docs/MASTER-INSTALL-PROMPT.md`](docs/MASTER-INSTALL-PROMPT.md) | Universal zero-config agent installer for fresh systems. |
| **Clean Install Prompt** | [`docs/CLEAN-INSTALL-PROMPT.md`](docs/CLEAN-INSTALL-PROMPT.md) | Non-destructive clean reinstallation preserving provider history. |
| **Repair & Update Prompt** | [`docs/REPAIR-AND-UPDATE-PROMPT.md`](docs/REPAIR-AND-UPDATE-PROMPT.md) | Diagnostic & self-healing prompt for degraded environments. |
| **Diagnostic Doctor Prompt** | [`docs/DIAGNOSTIC-PROMPT.md`](docs/DIAGNOSTIC-PROMPT.md) | Fast 16-point system health audit prompt. |
| **Forensic Baseline Audit** | [`docs/BASELINE-AUDIT.md`](docs/BASELINE-AUDIT.md) | Empirical audit methodology and verification evidence. |
| **Model Tier Strategy** | [`docs/MODEL-TIER-STRATEGY.md`](docs/MODEL-TIER-STRATEGY.md) | Deep breakdown of the 6 composite routing tiers. |
| **Claude Desktop Setup** | [`docs/CLAUDE-DESKTOP-SETUP.md`](docs/CLAUDE-DESKTOP-SETUP.md) | Guide for Third-Party Inference mode & MCP server sync. |
| **Orchestra Integration** | [`docs/ORCHESTRA-INTEGRATION.md`](docs/ORCHESTRA-INTEGRATION.md) | Mode A (Standalone) vs Mode B (Connected Harness) rules. |

---

## CLI Command Reference

```bash
limitless doctor          # Run the 16-point comprehensive diagnostic suite
limitless status          # Display active profile, gateway reachability, and tiers
limitless verify          # Live HTTP 200 connectivity check across all 6 tiers
limitless setup           # Sync live models into optimized composite tiers
limitless launcher        # Launch Claude Code with scoped environment profile
limitless tui             # Real-time Terminal UI with live telemetry & latency graphs
limitless stats           # View token consumption and 3-layer financial accounting
limitless pin             # Manage task-to-model bindings (--list, --task, --model)
limitless checkpoint      # Capture SHA-256 hashed file snapshot before editing
limitless undo            # Instantly revert modified files to previous checkpoint
limitless rollback        # Create, list, or restore atomic database snapshots
limitless discover        # Scan live gateway models and probe local Ollama (:11434)
```

---

## Verification Sign-Off & Test Results

Limitless Claude 8.4.0 is verified 100% green:

```text
================================================================================
          LIMITLESS CLAUDE 8.4.0 — SYSTEM & GATEWAY DIAGNOSTIC DOCTOR
================================================================================
  [PASS] Node.js Runtime Version              : v24.19.0 (>= 22 required)
  [PASS] Platform Architecture                : win32 (x64), 32 cores
  [PASS] OmniRoute Database File              : C:\Users\Asus\.omniroute\storage.sqlite
  [PASS] SQLite Integrity & Schema Health     : Journal: WAL, 140 tables verified
  [PASS] OmniRoute API Key Authorization      : Active key: sk-ant...62127e
  [PASS] Local Gateway Reachability (:20128)  : HTTP 200 OK (2115ms)
  [PASS] Configured Provider Connections      : 14 active / 16 total
  [PASS] Discovered Model Catalog             : 585 models catalogued
  [PASS] Composite Routing Tiers (6 Tiers)    : All 6 tiers registered & tested
  [PASS] Capability Evaluator Governance      : Strict 6-stage lifecycle enforced
  [PASS] Billing Classifier Safety Guard      : Unknown costs return null (never $0.00)
  [PASS] Backup & Snapshot Directory          : Snapshots available for rollback
  [PASS] Claude Code Configuration Dir        : C:\Users\Asus\.claude
  [PASS] OpenRouter Capacity Policy           : $10 credit unlocks 1000 req/day
  [PASS] Orchestra Integration Gate           : Connected: Mode B Active (115 skills)
  [PASS] Local Ollama Engine (:11434)         : Standby / Optional (offline)
--------------------------------------------------------------------------------
Diagnostic Summary: 16 PASSED, 0 WARNINGS, 0 NOT TESTED, 0 FAILURES
Unit & Contract Test Suite: 97/97 PASSED (15 suites, 0 failures, 3.38s)
>>> System is healthy, operational, and production-ready.
================================================================================
```

---

## Releases & Changelog

### v8.4.0 (November 2026) — The Master Architectural Consolidation
- **Claude Desktop Third-Party Gateway Integration**: Full support for native Claude Desktop Third-Party inference mode (`Claude-3p/configLibrary`), `jo(e)` validator compliance, and MCP synchronization.
- **Dedicated Desktop Combos**: Implemented `combo/desktop-chat` for fast prose and `combo/desktop-cowork` for strict Anthropic XML `tool_use` execution.
- **Universal Master Install Prompt**: Created self-executing agent installer prompt in `docs/MASTER-INSTALL-PROMPT.md`.
- **OpenRouter $10 Multiplier Integration**: Formally integrated 1,000 req/day capacity policy on `:free` models.
- **P0 Security Hardening**: Completely eliminated raw API key leaks via Windows `setx`.
- **Expanded Capability Engine**: 24 modular workload profiles in `prompts/capabilities/`.
- **Gateway Persistence Watchdog**: Re-engineered `omniroute-daemon.bat` with auto-recovery loops and universal binary discovery.

### v8.3.0 (November 2026)
- Architectural hardening and policy plane realignment.
- Isolated deprecated Google Cloud Code internal models.

### v8.2.0 (November 2026)
- Interactive Terminal TUI with real-time latency graphs.
- Three-layer token and financial savings telemetry.
- Standby Ollama auto-discovery on port 11434.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
