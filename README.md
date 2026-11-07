# Limitless Claude 8.1

[![Version](https://img.shields.io/badge/version-8.1.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](package.json)
[![CI](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml/badge.svg)](https://github.com/mahik504/limitless-claude/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests: 100% Passing](https://img.shields.io/badge/tests-91%2F91%20passed-success.svg)](test/)
[![Acceptance: 6/6 Passed](https://img.shields.io/badge/e2e%20acceptance-6%2F6%20passed-success.svg)](scripts/e2e-acceptance.js)
[![Diagnostics: 15/15 Healthy](https://img.shields.io/badge/doctor-15%2F15%20healthy-success.svg)](scripts/doctor.js)

Limitless Claude routes coding-agent traffic across local and hosted model providers through an OmniRoute gateway. It connects Claude Code CLI, Cursor, Antigravity, OpenCode, and Superdesign to models from Kiro, Cloudflare, Groq, Mistral, GitHub Copilot, Cerebras, NVIDIA, and OpenRouter without modifying existing agent workflows.

---

## One-Line Instant Installation

Run the installer command for your operating system:

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.ps1 | iex
```

### macOS & Linux (Terminal)
```bash
curl -fsSL https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.sh | bash
```

The script verifies Node.js 22+, clones the repository, installs dependencies, registers the global `limitless` CLI command, auto-starts the local gateway, provisions a local API key, and synchronizes routing tiers.

---

## What's New in Limitless Claude 8.1

- **One-line automated installers (`install.ps1`, `install.sh`):** Automates cloning, dependency setup, global binary linking, and zero-config initialization.
- **Self-healing `limitless init` wizard:** Automatically detects gateway state, launches the daemon if stopped, provisions local API keys into SQLite, and configures `~/.claude/settings.json`.
- **Task-to-model pinning (`limitless pin`):** Allows pinning specific model endpoints to engineering tasks (backend, fast diffs, reasoning, frontend), prioritizing them during candidate selection.
- **Granular file checkpoints & undo (`limitless checkpoint` & `limitless undo`):** Captures atomic file-level snapshots before autonomous loops and rolls back individual changes without touching git history.
- **Clean verified routing combos:** Smoke-tested all endpoints against live HTTP 200 responses, removing deprecation strings and unroutable stubs.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        CC["Claude Code CLI"]
        CCE["Claude Code Extension"]
        CUR["Cursor Editor"]
        AGY["Antigravity IDE"]
        SD["Superdesign CLI"]
        OC["OpenCode"]
    end

    subgraph Core["Limitless Core Runtime"]
        CLI["Universal CLI (bin/limitless.js)"]
        LAUNCHER["Scoped Environment Launcher"]
        ACM["Agent Client Protocol Adapter<br/>Schema & tool translations, SSE parsing"]
        PE["Prompt Engine<br/>Constitution, capability profiles, model adapters"]
        PL["Prompt Laboratory<br/>Fixture-based regression testing"]
        SM["Session & Context Manager<br/>Checkpoints, compaction, token accounting"]
        PIN["Task Pinning Engine<br/>Task-to-model overrides"]
        UNDO["File Checkpoint & Undo Engine<br/>Per-file atomic snapshots"]
        CE["Capability Evaluator<br/>6 formal lifecycle stages"]
        BC["Billing & Quota Classifier<br/>7 classes, strict free-only enforcement"]
        FBE["Fallback Engine<br/>Deprecation traps & circuit breakers"]
        CFG["Config Manager<br/>WAL-safe SQLite snapshots"]
    end

    subgraph Gateway["Local Proxy (127.0.0.1:20128)"]
        Omni["OmniRoute Daemon"]
        DB["SQLite Storage (storage.sqlite)"]
        Perms["API Key & Combos Gate"]
    end

    subgraph Tiers["Composite Routing Tiers"]
        H["Haiku Tier: rapid edits and syntax"]
        S["Sonnet Tier: system design and reasoning"]
        F["Fable Tier: frontier model routing"]
        O["Opus Tier: multi-provider coding pool"]
    end

    subgraph Upstream["Upstream Providers"]
        P_KR["Kiro AI (Sonnet 4.5, GLM-5, Haiku 4.5, Qwen3, DeepSeek 3.2)"]
        P_CF["Cloudflare Workers AI (LLaMA 3.3 70B, DeepSeek R1, Qwen 32B)"]
        P_GH["GitHub Copilot (GPT-4o, GPT-4o Mini)"]
        P_GQ["Groq Hardware (LPU inference)"]
        P_MS["Mistral AI (Codestral Latest)"]
        P_NVI["NVIDIA NIM (Nemotron 3.5 Free)"]
        P_CER["Cerebras (Llama 3.1 8B)"]
        P_OR["OpenRouter (Free & metered tiers)"]
        P_OLL["Ollama (Cloud & local)"]
    end

    Clients --> LAUNCHER
    CLI --> LAUNCHER
    LAUNCHER --> Core
    Core --> Gateway
    Gateway --> Tiers
    Tiers --> Upstream
```

---

## Operating Modes

Limitless Claude supports two modes depending on your workspace setup:

### Mode A: Standalone Mode
Runs independently without external orchestrators. The engine inspects standard repository files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`) and composes them into task instructions. The core runtime under `src/core/` does not import any external framework code.

### Mode B: Orchestra Interoperability
When an Orchestra installation is detected (such as `C:\projects\orchestra-workflow`), the adapter at `src/integrations/orchestra/adapter.js` activates automatically. Orchestra coordinates high-level tasks and memory, while Limitless Claude handles upstream model routing, prompt composition, and protocol translation. If Orchestra is removed or disabled, Limitless Claude continues operating under Mode A.

---

## Five-Layer Prompt Engine

Rather than maintaining a static prompt string, `src/core/prompt-engine.js` composes instructions from five independent layers:

```mermaid
flowchart TD
    L1["Layer 1: Universal Engineering Constitution<br/>Inspection before modification, zero empty stubs, verification gate"] --> L2
    L2["Layer 2: Task Capability Profiles<br/>Fast, Balanced, Reasoning, Frontend, 3D, Backend, Review, Docs"] --> L3
    L3["Layer 3: Model Family Adapters<br/>DeepSeek reasoning tags, Kiro XML, Mistral types, Qwen schemas"] --> L4
    L4["Layer 4: Project Context Adapter<br/>Sanitized project instructions from AGENTS.md, CLAUDE.md, etc."] --> L5
    L5["Layer 5: Tool & Execution Contract<br/>JSON argument types, filesystem checks, error diagnostics"]
```

1. Universal Constitution (`prompts/universal/constitution.md`): Requires reading existing code before edits, forbids empty stubs (`// TODO`), and requires test output before claiming fixes.
2. Capability Profiles (`prompts/capabilities/`): Loads instructions for specific tasks: `fast` (atomic diffs), `balanced` (features with tests), `reasoning` (architectural analysis), `frontend` (React 19 and CSS), `3d` (Three.js and R3F disposal), `backend` (PostgreSQL RLS), `review` (vulnerability audits), and `documentation`.
3. Provider Adapters (`prompts/providers/`): Formats instructions for specific model behaviors, including DeepSeek `<think>` reasoning tags, Kiro XML tags, and Mistral type signatures.
4. Project Context: Reads repository instructions and wraps them in security delimiters (`<<<PROJECT_CONTEXT_START>>>`) to defend against prompt injection.
5. Tool Contract (`prompts/contracts/standard-contract.md`): Specifies exact JSON types, filesystem boundaries, and error recovery behavior.

---

## Composite Model Tiers

OmniRoute groups verified upstream models into four composite aliases. Every model is verified against live HTTP 200 responses before entering production combos:

| Tier | Primary Purpose | Primary Endpoints | Billing Classes |
| :--- | :--- | :--- | :--- |
| **Haiku** (`limitless-haiku-4.5`) | Syntax checks, atomic line diffs, quick tool calls | Kiro Claude Haiku 4.5, Cloudflare LLaMA 3.3 70B, GitHub GPT-4o Mini, Groq LPU, Cloudflare GLM 4.7 Flash, OpenRouter Nemotron Free | `provider_free_quota`, `subscription-entitled` |
| **Sonnet** (`limitless-sonnet-5.5`) | System architecture, code review, debugging | Kiro Claude Sonnet 4.5, Kiro GLM-5, GitHub GPT-4o, Cloudflare DeepSeek R1, Kiro Qwen3 Coder, Kiro DeepSeek 3.2 | `subscription-entitled`, `provider_free_quota` |
| **Fable** (`limitless-fable-reasoning`) | Frontier context synthesis and multi-agent coordination | Kiro Claude Sonnet 4.5, GitHub GPT-4o, Mistral Codestral, Kiro GLM-5, Cloudflare DeepSeek R1 | `subscription-entitled`, `paid-token` |
| **Opus** (`limitless-opus-4.6`) | Long coding loops, fullstack features, 3D scenes | 23-model pool across Mistral Codestral, Kiro, Cloudflare, GitHub, Groq, and OpenRouter free tiers | `provider_free_quota`, `subscription-entitled`, `paid-token` |

### Billing Taxonomy
- `provider_free_quota`: Vendor free tier with rate limits (Groq, Cloudflare Workers AI, Cerebras, NVIDIA NIM).
- `subscription-entitled`: Flat monthly subscription covering inference without per-token charges (GitHub Copilot, Kiro AI).
- `paid-token`: Metered per-token commercial APIs (Mistral, OpenAI, Anthropic, OpenRouter paid).
- `local`: Self-hosted local inference (Ollama, vLLM).
- `unknown`: Pricing is unverified. Returns `null` cost and is excluded in free-only mode.

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

## Master Installation & Repair Prompts

Use these prompts when setting up or repairing Limitless Claude in an AI coding assistant.

### Prompt 1: Clean Installation (New Environment)

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

---

### Prompt 2: Repair, Update & Re-Sync (Existing Setup)

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

## Protocol & Tool Translation

Limitless Claude provides bidirectional translation between Anthropic Messages API and OpenAI Chat format:

```mermaid
sequenceDiagram
    participant Client as Client (OpenCode / Cursor / Claude Code)
    participant Adapter as AgentClient Protocol Adapter
    participant Gateway as OmniRoute Gateway (:20128)
    participant Provider as Upstream Model Provider

    Client->>Adapter: Sends request (Anthropic or OpenAI format)
    Adapter->>Adapter: Maps tool schemas (input_schema <-> parameters)
    Adapter->>Adapter: Maps message turns (tool_use/tool_result <-> tool_calls/role:tool)
    Adapter->>Gateway: Forwards normalized payload
    Gateway->>Provider: Routes to target upstream model
    Provider-->>Gateway: Streams SSE chunks
    Gateway-->>Adapter: Relays raw stream
    Adapter->>Adapter: Normalizes SSE events (content_block_delta <-> choices.delta)
    Adapter-->>Client: Returns client-native stream
```

---

## Token Capacity & OpenRouter Quota Intelligence

### OpenRouter Policy (Verified November 2026)
- Unfunded accounts: Limited to **50 requests per day** across `:free` models.
- Funded accounts (\$10 credit deposit): Unlocks **1,000 requests per day** across `:free` models without deducting from the \$10 deposit on free endpoints.
- Upstream rate limits: Individual models may enforce separate concurrency and per-minute request caps.

### Daily Throughput Reference Table

| Workload Profile | Tokens / Req | 50 Req/Day (Unfunded) | 1,000 Req/Day (\$10 Deposit) |
| :--- | :---: | :---: | :---: |
| Micro-Patch / Syntax (1k in / 1k out) | 2,000 | 0.10M tokens/day | 2.00M tokens/day |
| Standard Feature / Tests (4k in / 1k out) | 5,000 | 0.25M tokens/day | 5.00M tokens/day |
| Full Architecture / Backend (10k in / 2k out) | 12,000 | 0.60M tokens/day | 12.00M tokens/day |

Run `limitless budget` in your terminal or read [`docs/TOKEN-CAPACITY.md`](docs/TOKEN-CAPACITY.md) for custom scenario calculations.

---

## Prompt Laboratory

The Prompt Laboratory (`src/core/prompt-lab.js`) runs regression fixtures against prompt variants:
- Tests syntax fixes, PostgreSQL RLS policies, Three.js `.dispose()` cleanup, and secret leak detection.
- Measures correctness score, pass rates, latency, and token efficiency.
- Halts deployment if a prompt modification causes a regression on standard fixtures.

Run `limitless prompt test` or inspect [`docs/PROMPT-LAB-REPORT.md`](docs/PROMPT-LAB-REPORT.md).

---

## Session Continuity & Context Compaction

- Turn Checkpoints (`src/core/session-manager.js`): Records in-memory checkpoints at conversation turns. If an upstream turn fails unrecoverably, the session rolls back to a known good turn.
- Context Compaction (`src/core/context-manager.js`): Tracks token counts against context limits. When context reaches 80% capacity, it truncates verbose terminal output while preserving active objectives, modified file paths, and unresolved errors.

---

## Snapshots and Rollback

Limitless Claude supports atomic configuration and database rollbacks:
- Pre-switch snapshots are captured before profile changes or tier updates.
- SQLite backups use clean WAL checkpoints (`VACUUM INTO` via `src/omniroute/db.js`), preventing database corruption.
- Rollback commands:
  ```bash
  limitless rollback --create <tag> # Create a manual WAL-safe snapshot
  limitless rollback --list         # Show available snapshots
  limitless rollback --latest       # Restore the most recent snapshot
  ```

---

## Verification Results

The 8.1.0 release passed all local automated gates:

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
