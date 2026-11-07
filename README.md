# Limitless Claude 8.1

[![Version](https://img.shields.io/badge/version-8.1.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](package.json)
[![CI](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml/badge.svg)](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests: 100% Passing](https://img.shields.io/badge/tests-91%2F91%20passed-success.svg)](test/)
[![Acceptance: 6/6 Passed](https://img.shields.io/badge/e2e%20acceptance-6%2F6%20passed-success.svg)](scripts/e2e-acceptance.js)
[![Diagnostics: 15/15 Healthy](https://img.shields.io/badge/doctor-15%2F15%20healthy-success.svg)](scripts/doctor.js)

Limitless Claude routes coding-agent traffic across local and hosted model providers through a local OmniRoute gateway (`http://127.0.0.1:20128`). It connects Claude Code CLI, Cursor, Antigravity, OpenCode, and Superdesign to models from Kiro, Cloudflare, Groq, Mistral, GitHub Copilot, Cerebras, NVIDIA, and OpenRouter without altering agent tool calls or workflow configurations.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Clients["Client Layer (IDEs & CLIs)"]
        CC["Claude Code CLI"]
        CCE["Claude Code Extension"]
        CUR["Cursor Editor"]
        AGY["Antigravity IDE"]
        SD["Superdesign CLI"]
        OC["OpenCode"]
    end

    subgraph Core["Limitless Core Runtime (src/core/)"]
        CLI["Universal CLI (bin/limitless.js)"]
        LAUNCHER["Scoped Environment Launcher"]
        ACM["Agent Client Protocol Adapter<br/>Bidirectional SSE & Schema Normalization"]
        PE["5-Layer Prompt Engine<br/>Constitution, Task Profiles, Model Adapters"]
        PL["Prompt Laboratory<br/>Regression Test Fixtures"]
        SM["Session & Context Manager<br/>Checkpoints & Token Compaction"]
        PIN["Task Pinning Engine<br/>Role-to-Model Overrides"]
        UNDO["File Checkpoint & Undo Engine<br/>Per-File Atomic Revert"]
        CE["Capability Evaluator<br/>6-Stage Formal Lifecycle"]
        BC["Billing & Quota Classifier<br/>7 Classes, Strict Zero-Marginal Guard"]
        FBE["Fallback Engine<br/>Deprecation Traps & Circuit Breakers"]
        CFG["Config Manager<br/>WAL-Safe SQLite Backups"]
    end

    subgraph Gateway["Local Gateway (127.0.0.1:20128)"]
        Omni["OmniRoute Daemon"]
        DB["SQLite Database (storage.sqlite)"]
        Perms["API Key Permissions Gate"]
    end

    subgraph Tiers["Composite Routing Tiers"]
        H["Haiku Tier: Sub-second syntax and atomic line diffs"]
        S["Sonnet Tier: Architectural reasoning, system design, review"]
        F["Fable Tier: Frontier context synthesis and multi-agent loops"]
        O["Opus Tier: 23-model agentic coding reservoir"]
    end

    subgraph Upstream["Upstream Model Providers"]
        P_KR["Kiro AI (Sonnet 4.5, GLM-5, Haiku 4.5, Qwen3, DeepSeek 3.2)"]
        P_CF["Cloudflare Workers AI (LLaMA 3.3 70B, DeepSeek R1, Qwen 32B)"]
        P_GH["GitHub Copilot (GPT-4o, GPT-4o Mini)"]
        P_GQ["Groq Hardware (LPU Fast Inference)"]
        P_MS["Mistral AI (Codestral Latest)"]
        P_NVI["NVIDIA NIM (Nemotron 3.5 Free)"]
        P_CER["Cerebras (Llama 3.1 8B)"]
        P_OR["OpenRouter (Free & Metered Tiers)"]
        P_OLL["Ollama (Cloud & Local Self-Hosted)"]
    end

    Clients --> LAUNCHER
    CLI --> LAUNCHER
    LAUNCHER --> Core
    Core --> Gateway
    Gateway --> Tiers
    Tiers --> Upstream
```

### Layer Responsibilities

1. **Client Layer:** Tools like Claude Code CLI, Cursor, and Antigravity send standard OpenAI or Anthropic API requests to `http://127.0.0.1:20128`.
2. **Core Runtime Layer:** Normalizes schemas, translates tool calling arguments, checks task pins, evaluates rate-limit circuit breakers, and composes five-layer instructions.
3. **Gateway Layer:** An OmniRoute proxy running locally with a WAL-mode SQLite database (`~/.omniroute/storage.sqlite`) managing credentials, keys, and combo definitions.
4. **Composite Routing Tiers:** Four aliases that distribute requests across pools of models according to task latency, context requirements, and cost.
5. **Upstream Providers:** Connected inference endpoints spanning commercial APIs, developer subscriptions, and free vendor quotas.

---

## How It Works

Limitless Claude provides bidirectional translation between Anthropic Messages API and OpenAI Chat formats, allowing clients expecting Anthropic-formatted tools and streaming SSE chunks to communicate with any OpenAI-compatible provider:

```mermaid
sequenceDiagram
    autonumber
    participant IDE as Coding Client (Cursor / Claude Code / OpenCode)
    participant ACM as Agent Client Protocol Adapter (src/core/agent-client.js)
    participant PE as 5-Layer Prompt Engine (src/core/prompt-engine.js)
    participant PIN as Task Pinning & Routing Policy (src/core/routing-policy.js)
    participant GW as OmniRoute Gateway (:20128)
    participant UP as Upstream Model Provider

    IDE->>ACM: Sends API Request (Anthropic Messages API or OpenAI Chat)
    ACM->>ACM: Normalize Tool Schemas (input_schema <-> parameters)
    ACM->>ACM: Map Message Roles (tool_use / tool_result <-> tool_calls / role:tool)
    ACM->>PE: Compose Prompt Context
    PE->>PE: Layer 1: Constitution + Layer 2: Task Profile + Layer 3: Model Adapter + Layer 4: AGENTS.md + Layer 5: Tool Contract
    ACM->>PIN: Select Upstream Target (Honor Active Task Pins & Circuit Breakers)
    PIN->>GW: Forward Normalized Payload
    GW->>UP: Route to Optimal Provider / Model
    UP-->>GW: Stream Server-Sent Events (SSE)
    GW-->>ACM: Relay Raw SSE Chunks
    ACM->>ACM: Normalize Streaming Events (content_block_delta <-> choices.delta)
    ACM-->>IDE: Deliver Client-Native Streaming Response
```

### Five-Layer Prompt Engine

Rather than maintaining a static prompt string, `src/core/prompt-engine.js` composes instructions from five independent layers:

```mermaid
flowchart TD
    L1["Layer 1: Universal Engineering Constitution<br/>Inspection before modification, zero empty stubs, verification gate"] --> L2
    L2["Layer 2: Task Capability Profiles<br/>Fast, Balanced, Reasoning, Frontend, 3D, Backend, Review, Docs"] --> L3
    L3["Layer 3: Model Family Adapters<br/>DeepSeek reasoning tags, Kiro XML, Mistral types, Qwen schemas"] --> L4
    L4["Layer 4: Project Context Adapter<br/>Sanitized project instructions from AGENTS.md, CLAUDE.md, etc."] --> L5
    L5["Layer 5: Tool & Execution Contract<br/>JSON argument types, filesystem checks, error diagnostics"]
```

1. **Universal Constitution (`prompts/universal/constitution.md`):** Requires inspecting existing files before modification, forbids empty placeholders (`// TODO`), and requires test execution before claiming fixes.
2. **Task Capability Profiles (`prompts/capabilities/`):** Loads specialized instructions for `fast` (atomic diffs), `balanced` (features with tests), `reasoning` (architectural analysis), `frontend` (React 19 and CSS), `3d` (Three.js and R3F disposal), `backend` (PostgreSQL RLS), `review` (vulnerability audits), and `documentation`.
3. **Provider Adapters (`prompts/providers/`):** Formats instructions for specific model behaviors, including DeepSeek `<think>` reasoning tags, Kiro XML tags, and Mistral type signatures.
4. **Project Context:** Reads repository instructions and wraps them in security delimiters (`<<<PROJECT_CONTEXT_START>>>`) to defend against prompt injection.
5. **Tool Contract (`prompts/contracts/standard-contract.md`):** Specifies exact JSON types, filesystem boundaries, and error recovery behavior.

---

## Operating Modes

Limitless Claude supports two modes depending on your workspace setup:

### Mode A: Standalone Mode
Runs independently without external orchestrators. The engine inspects standard repository files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`) and composes them into task instructions. The core runtime under `src/core/` does not import external framework code.

### Mode B: Orchestra Interoperability
When an Orchestra installation is detected (such as `C:\projects\orchestra-workflow`), the adapter at `src/integrations/orchestra/adapter.js` activates automatically. Orchestra coordinates high-level tasks and memory, while Limitless Claude handles upstream model routing, prompt composition, and protocol translation. If Orchestra is removed or disabled, Limitless Claude continues operating under Mode A.

---

## Four Composite Routing Tiers

OmniRoute groups upstream models into four composite aliases. Every model is verified against live HTTP 200 responses before entering production combos:

| Tier | Primary Purpose | Verified Model Endpoints | Billing Classes |
| :--- | :--- | :--- | :--- |
| **Haiku** (`limitless-haiku-4.5`) | Syntax checks, atomic line diffs, quick tool checks (< 1s) | Kiro Claude Haiku 4.5, Cloudflare LLaMA 3.3 70B, GitHub GPT-4o Mini, Groq LPU, Cloudflare GLM 4.7 Flash, OpenRouter Nemotron Free | `provider_free_quota`, `subscription-entitled` |
| **Sonnet** (`limitless-sonnet-5.5`) | System architecture, deep reasoning, code review, debugging | Kiro Claude Sonnet 4.5, Kiro GLM-5, GitHub GPT-4o, Cloudflare DeepSeek R1, Kiro Qwen3 Coder, Kiro DeepSeek 3.2 | `subscription-entitled`, `provider_free_quota` |
| **Fable** (`limitless-fable-reasoning`) | Frontier context synthesis, multi-agent coordination | Kiro Claude Sonnet 4.5, GitHub GPT-4o, Mistral Codestral, Kiro GLM-5, Cloudflare DeepSeek R1 | `subscription-entitled`, `paid-token` |
| **Opus** (`limitless-opus-4.6`) | Long coding loops, fullstack features, 3D scenes | 23-model pool across Mistral Codestral, Kiro, Cloudflare, GitHub, Groq, and OpenRouter free tiers | `provider_free_quota`, `subscription-entitled`, `paid-token` |

### Billing Taxonomy
- `provider_free_quota`: Vendor free tier with rate limits (Groq, Cloudflare Workers AI, Cerebras, NVIDIA NIM).
- `subscription-entitled`: Flat monthly subscription covering inference without per-token charges (GitHub Copilot, Kiro AI).
- `paid-token`: Metered per-token commercial APIs (Mistral, OpenAI, Anthropic, OpenRouter paid).
- `local`: Self-hosted local inference (Ollama, vLLM).
- `unknown`: Pricing is unverified. Returns `null` cost and is excluded in free-only mode.

---

## Recommended Provider Setup (Admin Stack)

To replicate the admin's multi-provider setup, connect these providers in your OmniRoute dashboard (`http://localhost:20128`):

| Provider | Type | Typical Quotas & Models Provided |
| :--- | :--- | :--- |
| **Kiro AI** | Subscription | Claude Sonnet 4.5, Claude Haiku 4.5, GLM-5, Qwen3 Coder, DeepSeek 3.2 |
| **Cloudflare Workers AI** | Free Tier | 10,000 neurons/day. LLaMA 3.3 70B, DeepSeek R1 32B, Qwen 2.5 Coder 32B |
| **Groq Hardware** | Free Tier | Up to 14,400 requests/day (30 RPM). GPT-OSS 20B, LLaMA models on LPU silicon |
| **GitHub Copilot** | Subscription | GPT-4o, GPT-4o Mini flat monthly quota without per-token charges |
| **Mistral AI** | Commercial / Free | Codestral Latest (premier 80+ language coding model) |
| **OpenRouter** | Free & Metered | 50 req/day free (unfunded), or 1,000 req/day on `:free` models with a \$10 deposit |
| **Cerebras** | Free Tier | High-throughput LPU inference for Llama 3.1 8B (up to 30 RPM) |
| **NVIDIA NIM** | Free Tier | 1,000 free inference credits for Nemotron 3.5 Lightning |
| **Ollama (Local / Cloud)** | Local / Free | Unlimited self-hosted token throughput or cloud free tier |

> **Recommendation:** Configure the free providers (Cloudflare, Groq, OpenRouter, Cerebras, NVIDIA NIM) first. Once connected, running `limitless init` will automatically discover them and build out the four tiers. Connecting developer subscriptions (GitHub Copilot, Kiro AI) unlocks the heavier frontier models.

---

## Token Capacity & Daily Quota Estimates

By distributing traffic across multiple free and subscription providers, Limitless Claude provides high daily token throughput without running into single-provider rate limits:

| Setup Configuration | Daily Requests Available | Estimated Daily Tokens | Cost Profile |
| :--- | :---: | :---: | :---: |
| **Pure Free Tier Only**<br/>(Groq + Cloudflare + Cerebras + OpenRouter Free + NVIDIA) | ~25,000 req/day | **15M to 25M tokens/day** | **\$0.00 / month** |
| **Admin Setup (Free + Developer Subscriptions)**<br/>(Above Free Tier + GitHub Copilot + Kiro AI) | Unlimited concurrency | **35M to 50M+ tokens/day** | Flat subscriptions only |
| **Expanded Setup**<br/>(Admin Setup + Local Ollama / vLLM Models) | Hardware bounded | **Virtually Unlimited** | Self-hosted electricity |

### Workload Throughput Reference Table

| Workload Profile | Average Tokens / Req | 50 Req/Day (Unfunded OpenRouter) | 1,000 Req/Day (\$10 Deposit) | Full Admin Multi-Provider Stack |
| :--- | :---: | :---: | :---: | :---: |
| **Micro-Patch / Syntax** (1k in / 1k out) | 2,000 | 0.10M tokens/day | 2.00M tokens/day | **25M+ tokens/day** |
| **Standard Feature / Tests** (4k in / 1k out) | 5,000 | 0.25M tokens/day | 5.00M tokens/day | **20M+ tokens/day** |
| **Full Architecture / RLS** (10k in / 2k out) | 12,000 | 0.60M tokens/day | 12.00M tokens/day | **15M+ tokens/day** |

Run `limitless budget` or read [`docs/TOKEN-CAPACITY.md`](docs/TOKEN-CAPACITY.md) for custom scenario modeling.

---

## Task-to-Model Pinning

Assign dedicated model endpoints to specific engineering tasks:

```bash
limitless pin --list                                        # Show active pin overrides
limitless pin --task backend --model kiro/claude-sonnet-4.5 # Pin backend tasks to Sonnet 4.5
limitless pin --task fast --model groq/openai/gpt-oss-20b   # Pin fast edits to Groq LPU
limitless pin --remove backend                              # Clear backend pin override
limitless pin --reset                                       # Reset all task pin overrides
```

Pinned models automatically receive top priority during candidate selection when their matching capability profile is requested.

---

## File Checkpoint & Undo

Capture atomic snapshots of target files before running autonomous agent loops and roll back individual changes when needed:

```bash
# Capture a snapshot before edits
limitless checkpoint --create "pre-refactor auth" src/auth.js src/db.js

# Review and list stored snapshots
limitless checkpoint --list

# Verify what would change without modifying files
limitless undo --dry-run

# Revert files to the latest checkpoint
limitless undo

# Restore a specific historical checkpoint
limitless undo --id ckpt-2026-11-07T19-09-41-274Z-604909
```

---

## Universal CLI Commands

The `limitless` binary runs globally from any working directory:

```bash
# Core operations
limitless init               # Run zero-config self-healing initialization wizard
limitless doctor             # Run 15-point diagnostic sweep
limitless status             # Print active profile, gateway URL, and routing tiers
limitless verify             # Test HTTP 200 connectivity across all tiers
limitless setup              # Sync live OmniRoute models into composite tiers
limitless launcher           # Launch Claude Code under scoped profile

# Catalog and providers
limitless discover           # Scan and record live gateway models and providers
limitless models list        # List catalogued models (--free-only, --profile <name>)
limitless models inspect <id># View capability profile for a specific model
limitless providers list     # List connected providers and billing classes
limitless providers test     # Ping upstream provider endpoints through gateway

# Task pinning and file safety
limitless pin                # Pin specific models to engineering tasks
limitless checkpoint         # Create file-level snapshots before autonomous runs
limitless undo               # Revert modified files to the previous checkpoint

# Prompts and budget
limitless prompt list        # List capability profiles and provider adapters
limitless prompt compose     # Render 5-layer prompt with hash and section previews
limitless prompt test        # Run Prompt Laboratory regression fixtures
limitless budget             # View spend controls and daily token capacity estimates

# Benchmarking and recovery
limitless benchmark          # Run 12-task standardized benchmark
limitless acceptance         # Run 6-test end-to-end acceptance suite
limitless dashboard          # Open live terminal observability dashboard
limitless rollback --create  # Create a WAL-safe SQLite and config snapshot
limitless rollback --list    # List available database and config snapshots
limitless rollback --latest  # Restore most recent snapshot
```

---

## Installation & Setup

Choose the installation method that matches your environment:

### Method 1: One-Line Instant Installation

Run the automated installer script for your platform:

#### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.ps1 | iex
```

#### macOS & Linux (Terminal)
```bash
curl -fsSL https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.sh | bash
```

The installer verifies Node.js 22+, clones the repository, installs dependencies, registers the global `limitless` CLI command via `npm link`, checks/starts the OmniRoute gateway daemon, auto-provisions a local SQLite API key, configures `~/.claude/settings.json`, and synchronizes all routing tiers.

---

### Method 2: AI Agent Master Installation Prompts

If you are using an AI coding assistant (such as Antigravity, Cursor, or Claude Code), paste one of these master prompts to handle the setup automatically:

#### Prompt 1: Clean Installation (New Environment)

```text
Set up a clean installation of Limitless Claude 8.1 on this machine following these steps:

1. Repository setup:
   - Check if the repository exists at C:\projects\limitless-claude (or clone from https://github.com/mahik504/limitless-claude.git).
   - Ensure Node.js is version 22 or higher. Run `npm install` inside the project root.

2. Run self-healing initialization wizard:
   - Run `node bin/limitless.js init`.
   - The wizard automatically verifies Node 22+, checks/starts the OmniRoute gateway daemon, auto-provisions a local SQLite API key if none exists, configures ~/.claude/settings.json, captures a safety snapshot, discovers models, and configures the 4 composite tiers.

3. Diagnostic check:
   - Run `node bin/limitless.js doctor`.
   - Confirm all 15 checkpoints pass, including database integrity, API key permissions, gateway reachability, model catalog, and billing guards.

4. Verification:
   - Run `node bin/limitless.js verify` to confirm HTTP 200 connectivity on all 4 tiers.
   - Run `node bin/limitless.js acceptance` to execute the 6-test acceptance suite.
   - Run `npm test` to verify unit and contract tests pass.

5. Completion:
   - Run `node bin/limitless.js status` to display the active tier configuration.
   - Use `limitless launcher` to start a Claude Code session.
```

#### Prompt 2: Repair, Update & Re-Sync (Existing Setup)

```text
Repair and re-synchronize an existing Limitless Claude installation using these steps:

1. Create snapshot:
   - Run `node bin/limitless.js rollback --create pre-repair` to capture a WAL-safe SQLite and configuration snapshot before making modifications.
   - Keep existing API keys, provider configurations, and user credentials intact.

2. Database and key checks:
   - Check that ~/.omniroute/storage.sqlite is accessible.
   - Run `node bin/limitless.js doctor`. If the API key is in restricted mode, ensure all composite tiers are included in allowed_combos.
   - Remove deprecated endpoints from primary positions.

3. Discovery and classification:
   - Run `node bin/limitless.js discover` to read live gateway endpoints.
   - Update model records with formal lifecycle states (ESTIMATED, SMOKE_TESTED, PRODUCTION_APPROVED).
   - Verify unknown model pricing returns null, preventing unintended charges in free-only mode.

4. Re-sync tiers:
   - Run `node bin/limitless.js setup` to update Haiku, Sonnet, Opus, and Fable tiers with active models.
   - Update the 5-layer Universal Engineering Constitution in combos.system_message.

5. Verification:
   - Run `node bin/limitless.js verify` to confirm HTTP 200 connectivity across all tiers.
   - Run `node bin/limitless.js prompt test` to verify Prompt Laboratory fixtures pass.
   - Run `npm test` to confirm test suites pass.
   - Run `limitless status` to display the verified configuration.
```

---

### Method 3: Manual Installation

If you prefer installing step by step without scripts:

1. Ensure Node.js version 22 or higher is installed (`node -v`).
2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/mahik504/limitless-claude.git
   cd limitless-claude
   npm install
   npm link
   ```
3. Run the zero-config initialization wizard:
   ```bash
   limitless init
   ```
4. Verify the installation:
   ```bash
   limitless doctor
   limitless verify
   ```

---

## Verification Results

The 8.1.0 release passed all local automated verification gates:

```text
Unit & Contract Tests (`npm test`)        : 91/91 passed (13 suites)
System Diagnostic Doctor (`limitless doctor`): 15/15 passed (Orchestra Mode B Active)
Tier Connectivity (`limitless verify`)     : 8/8 routes HTTP 200 OK
End-to-End Acceptance (`limitless acceptance`): 6/6 passed
Prompt Laboratory (`limitless prompt test`) : 4/4 fixtures passed (100% score)
```

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
