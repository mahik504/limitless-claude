# Limitless Claude v4.5

> **Your Claude Code workflow. Your connected model fleet.**
>
> *A robust, hardened configuration harness for routing Claude Code through OmniRoute to supported third-party models. Built for predictable routing, transactional SQLite state, isolated testing, and reproducible local developer setup.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D22-brightgreen.svg)](https://nodejs.org/)
[![OmniRoute](https://img.shields.io/badge/Gateway-OmniRoute-orange.svg)](https://github.com/danny-avila/OmniRoute)
[![Tests Passing](https://img.shields.io/badge/Tests-36%2F36%20Passing-success.svg)](test/)

Limitless Claude is an open-source configuration and model-routing harness that connects **Claude Code** to a dynamic fleet of third-party AI models through **OmniRoute**. Instead of binding your agentic coding sessions to a single provider meter or running into sudden rate-limit brick walls, Limitless Claude aggregates your existing developer accounts—including zero-marginal-cost community endpoints, subscription-entitled access (such as GitHub Copilot and Antigravity), and pay-as-you-go providers—into four specialized coding tiers.

---

## 1. What Limitless Claude Does (and Why It Exists)

Deep agentic coding loops run high token volumes through terminal actions, automated test suites, and file modifications. When using Claude Code, configuring diverse upstream models can be difficult and fragmented.

Limitless Claude solves this by providing:
- **Four Purpose-Built Tiers:** Four pre-configured combo profiles (`Haiku`, `Sonnet`, `Opus`, `Fable`) with tuned system prompts and routing policies.
- **Dynamic Provider Filtering:** Scans your active OmniRoute providers and automatically configures only the models you actually have authenticated access to.
- **Safe Database Management:** Manages OmniRoute's SQLite database atomically with verified, WAL-consistent backups (preferring `VACUUM INTO`, with verified checkpoint fallback) and minimal API key permissions.
- **Silent Background Launchers:** Windows VBScript/Batch launcher with an auto-recovery restart loop in Startup, and Unix background runner script (`start-daemon.sh`).
- **Claude Code Compatibility:** Standard Claude Code developer workflows (tool calling, file editing, terminal commands, slash commands like `/plan` and `/compact`, and MCP servers) are supported via OmniRoute's proxying of the Anthropic Messages API (`POST /v1/messages`).
- **Transparent Capacity Modeling:** Clear, reproducible calculations of your aggregate daily theoretical token capacity.

---

## 2. What Limitless Claude Does NOT Do

To keep expectations clear, honest, and grounded:
- **Not an Inference Provider:** Limitless Claude does not supply free compute or host AI models. You connect your own provider accounts through OmniRoute.
- **Not Official Anthropic Models:** The tier names `Haiku`, `Sonnet`, `Opus`, and `Fable` are internal routing profiles. They route to models such as Qwen, DeepSeek, Llama, and GPT-4o. In particular, **Fable is an internal composite profile, not an Anthropic model**.
- **No Stolen System Prompts:** This repository does not contain Anthropic's proprietary system instructions. It uses Limitless Claude's own functional coding instructions designed to minimize conversational filler and maximize tool use accuracy.
- **No Parity Guarantees:** Third-party open-weight models have distinct strengths and limits. Model quality, speed, context window, and tool reliability depend directly on upstream provider capabilities.
- **No Affiliation:** Limitless Claude is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Anthropic or Google.

---

## 3. Architecture & Request-Flow Mermaid Diagrams

Claude Code communicates with the local gateway using the standard Anthropic Messages API protocol (`POST /v1/messages`). OmniRoute intercepts the request, matches the model alias against registered mappings, applies tier persona prompts, and routes through the chosen strategy.

```mermaid
flowchart TD
    subgraph Client ["Client Environment"]
        CC["Claude Code CLI (Terminal / VS Code / Cursor)"]
    end

    subgraph Gateway ["Local Gateway: 127.0.0.1:20128"]
        OR["OmniRoute Core"]
        subgraph Tiers ["Limitless Routing Tiers"]
            H["Haiku (Priority Waterfall)"]
            S["Sonnet (Priority Waterfall)"]
            O["Opus (Round-Robin Reservoir)"]
            F["Fable (Round-Robin Premium)"]
        end
    end

    subgraph Providers ["Upstream Providers"]
        P1["Groq / Gemini API"]
        P2["GitHub Copilot / Antigravity"]
        P3["OpenRouter (Free Pool)"]
        P4["HuggingChat / Ollama Cloud"]
        P5["Mistral / OpenRouter (Paid)"]
    end

    CC -->|"POST /v1/messages (Anthropic Protocol)"| OR
    OR --> Tiers
    H -->|"Latency Waterfall"| P1 & P3
    S -->|"Reasoning Waterfall"| P2 & P4
    O -->|"RPM Load-Balancing (17 Models)"| P3 & P4
    F -->|"Premium Subscription Pool"| P2 & P5
```

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Agent
    participant CC as Claude Code CLI
    participant OR as OmniRoute Gateway (localhost:20128)
    participant Tier as Limitless Tier Combo
    participant Upstream as Upstream Provider (Qwen, DeepSeek, Groq)

    Dev->>CC: Run `claude` (or `claude --model limitless-opus`)
    CC->>OR: POST /v1/messages (ANTHROPIC_BASE_URL: 127.0.0.1:20128)
    OR->>Tier: Matches alias pattern (*opus*, *sonnet*, *haiku*, *fable*)
    Note over Tier: Injects tier system instructions & applies routing strategy
    Tier->>Upstream: Forwards request to active candidate model
    Upstream-->>Tier: Returns code tokens & tool-use calls
    Tier-->>OR: Normalizes response payload
    OR-->>CC: 200 OK (Anthropic-shaped JSON / SSE stream)
    CC-->>Dev: Executes file diffs, terminal commands, or tests
```

*For in-depth architectural details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).*

---

## 4. The Four Tiers and Routing Strategies

| Tier | Routing Strategy | Primary Focus | Models Configured | Primary Access Class |
|---|---|---|---|---|
| **⚡ Haiku** | **Priority Waterfall** | Instant syntax lookups, file tree exploration, fast tool verification | 7 candidates (Groq Llama, Gemini Flash Lite, GLM) | Zero-Marginal-Cost & Subscriptions |
| **🧠 Sonnet** | **Priority Waterfall** | Architectural planning, multi-step debugging, deep code review | 6 candidates (Claude Thinking, DeepSeek Reasoner, Command R+) | Subscription-Entitled |
| **🛠️ Opus** | **Round-Robin** | High-volume code generation and multi-agent refactoring loops | 17 candidates (Qwen 2.5 Coder, Codestral, DeepSeek, GLM) | Zero-Marginal-Cost Reservoir |
| **👑 Fable** | **Round-Robin** | High-context synthesis leveraging premium developer subscriptions | 6 candidates (GPT-4o, Claude Opus, Gemini Pro) | Subscription-Entitled & Paid |

*For exact model IDs, cascade orders, and mapping priority rules, review [docs/MODEL-CATALOG.md](docs/MODEL-CATALOG.md).*

---

## 5. Token-Capacity Modeling

By load-balancing requests across diverse providers, Limitless Claude mitigates single-provider rate-limit bottlenecks. Under stated assumptions (2,500 average tokens per round-trip request), the **theoretical modeled capacity reaches ~28,000,000 tokens per day**.

```
┌──────────────────────────────────────────────────────────┐
│ ESTIMATED THEORETICAL CAPACITY: ~28M TOKENS / DAY        │
├──────────────────────────┬───────────────────────────────┤
│ Zero-Marginal-Cost (ZMC) │ ~16.5M tokens (59%)           │
│ Subscription-Entitled    │ ~8.5M tokens (30%)            │
│ Metered Paid Inference   │ ~3.0M tokens (11%)            │
└──────────────────────────┴───────────────────────────────┘
```

### Critical Modeling Caveats
1. **Modeled vs. Practical Throughput:** A human developer writing code generates far fewer tokens than an automated multi-agent loop running round-the-clock.
2. **Concurrent Availability:** Assumes all configured providers and free endpoints are concurrently accessible.
3. **Shared Quotas:** If your GitHub Copilot subscription is utilized by both Sonnet and Fable, requests issued by Sonnet directly decrement available volume for Fable.
4. **No SLA:** Free model rate limits and availability can change without notice.

*Read the transparent methodology in [docs/TOKEN-CAPACITY.md](docs/TOKEN-CAPACITY.md).*

---

## 6. Installation & Quickstart

### Prerequisites
- **Node.js** v22 or later (`node -v`)
- **npm** v10 or later
- **Claude Code CLI** (`npm install -g @anthropic-ai/claude-code`)
- **OmniRoute** (`npm install -g omniroute@latest`)

---

## 7. First-Time OmniRoute Setup & Provider Authentication

1. In a terminal, launch OmniRoute:
   ```bash
   omniroute serve
   ```
2. Open `http://localhost:20128` in your browser.
3. Navigate to **Providers** and connect whichever free, open-source, or subscription accounts you have (e.g., GitHub Copilot, OpenRouter, Groq).
4. Navigate to **API Keys** and confirm an active key exists (or create one).

---

## 8. Connecting Claude Code to OmniRoute

Clone the repository and run setup:
```bash
git clone https://github.com/mahik504/limitless-claude.git
cd limitless-claude
npm install
npm run setup
```

**What `npm run setup` performs safely:**
1. Connects to `~/.omniroute/storage.sqlite` and creates a WAL-consistent backup (`storage.sqlite.bak`).
2. Validates schema compatibility.
3. Filters tier candidates against your authenticated providers.
4. Atomically registers combos, system instructions, and routing mappings.
5. Preserves restricted API key modes without silently granting global access.
6. Writes active configuration snapshot to `config/tier-configuration.json`.
7. On Windows, registers an invisible auto-restart daemon in your Windows Startup directory.
8. On Linux/macOS, creates an executable background runner (`start-daemon.sh`).

### Configuring Claude Code Environment

**Option A: Global Configuration via `~/.claude/settings.json` (Recommended)**
Add or update the following fields in your `~/.claude/settings.json`:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128",
    "ANTHROPIC_AUTH_TOKEN": "your-omniroute-api-key",
    "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY": "true"
  }
}
```

**Option B: Terminal Environment Variables**
On Windows (PowerShell):
```powershell
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:20128"
$env:ANTHROPIC_AUTH_TOKEN = "your-omniroute-api-key"
```
On Linux / macOS:
```bash
export ANTHROPIC_BASE_URL="http://127.0.0.1:20128"
export ANTHROPIC_AUTH_TOKEN="your-omniroute-api-key"
```

---

## 9. IDE Integration Guidance

### Claude Code Terminal
Works out of the box once `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` are set in your environment or `~/.claude/settings.json`. Run:
```bash
claude
```
Or target a specific routing profile:
```bash
claude --model limitless-opus
claude --model limitless-sonnet
claude --model limitless-haiku
claude --model limitless-fable
```

### VS Code Extension
The Claude Code VS Code extension reads settings from `~/.claude/settings.json` and respects VS Code `claudeCode.environmentVariables` settings:
```json
{
  "claudeCode.environmentVariables": [
    { "name": "ANTHROPIC_BASE_URL", "value": "http://127.0.0.1:20128" },
    { "name": "ANTHROPIC_AUTH_TOKEN", "value": "your-omniroute-api-key" }
  ]
}
```

### Cursor IDE
When running Claude Code within Cursor's integrated terminal, it automatically inherits your user environment variables (`ANTHROPIC_BASE_URL`). To use OmniRoute combos directly within Cursor's custom model settings, configure custom models pointing to `http://localhost:20128/v1`.

---

## 10. Native Claude Code Features: Ultra Code, Slash Commands, Skills & MCPs

Because Limitless Claude configures OmniRoute to translate and proxy Claude Code's requests to the Anthropic Messages API (`POST /v1/messages`), standard Claude Code workflows are supported across compatible upstream models:

- **Ultra Code & Agentic Refactoring:** Multi-turn autonomous tool execution (running tests, reading files, generating unified diffs, running shell commands) operates seamlessly over the configured model fleet.
- **Slash Commands:** Native Claude Code commands like `/plan` (architecture mode), `/compact` (context summarization), `/cost` (token reporting), `/doctor` (health check), and `/clear` function without interference.
- **Claude Code Skills & Custom Tools:** Custom tool definitions passed in `tools` payload blocks are forwarded cleanly to upstream models supporting tool-calling capabilities.
- **Model Context Protocol (MCP):** Any local or remote MCP servers configured in your Claude Code setup (`mcp.json`) communicate transparently through the routed combos.

---

## 11. Inspecting Model Aliases, Routing Results & Diagnosing Connection Failures

### Testing Model Aliases
To verify how a specific model alias routes through OmniRoute:
```bash
# Check Opus route
claude --model limitless-opus "Hello, what model profile are you?"

# Check Sonnet architectural route
claude --model limitless-sonnet "Explain your reasoning approach."

# Check Haiku rapid syntax route
claude --model limitless-haiku "Print 1+1"

# Check Fable high-context route
claude --model limitless-fable "Summarize project structure."
```

### Inspecting Live OmniRoute Logs
1. Open the OmniRoute dashboard at `http://localhost:20128/logs` or inspect stdout in your OmniRoute server terminal.
2. Every request shows:
   - Target combo ID (e.g., `combo/limitless-opus`).
   - Upstream model chosen by waterfall priority or round-robin rotation.
   - Response latency and HTTP status code.

### Diagnosing Gateway Connectivity
```bash
# Verify gateway HTTP health
curl -I http://127.0.0.1:20128/

# Verify Anthropic Messages endpoint
curl -X POST http://127.0.0.1:20128/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-omniroute-api-key" \
  -d "{}"
# Expected: HTTP 400 Bad Request (confirming endpoint is active and awaiting messages)
```

---

## 12. Diagnostic & Troubleshooting Guide

| Issue | Potential Cause | Tested Resolution |
|---|---|---|
| **OmniRoute Not Reachable** | Process not running or port 20128 blocked | Run `omniroute serve` or check `curl http://127.0.0.1:20128`. |
| **Authentication Error (401)** | Missing or mismatched OmniRoute API key | Copy your active API key from `http://localhost:20128/keys` into `ANTHROPIC_AUTH_TOKEN`. |
| **Model Alias Not Recognized** | Setup has not registered mappings | Run `npm run setup` to ensure mappings (`*opus*`, `*sonnet*`, etc.) are written to `model_combo_mappings`. |
| **No Models Found in Tier** | No matching providers authenticated | Visit `http://localhost:20128/providers`, connect at least one provider (e.g. GitHub Copilot, Groq, OpenRouter), and re-run `npm run setup`. |
| **SQLite Schema Incompatible** | Corrupted or outdated OmniRoute DB | Verify OmniRoute version is updated (`npm install -g omniroute@latest`). Setup verifies column presence before executing transactions. |
| **Daemon Repeatedly Restarting** | Invalid executable path in launcher | Re-run `npm run setup` to regenerate `omniroute-daemon.bat` with verified binary paths. |

---

## 13. Backup, Rollback & Uninstallation

- **Database Rollback:** If you ever need to restore your pre-setup OmniRoute database:
  ```bash
  cp ~/.omniroute/storage.sqlite.bak ~/.omniroute/storage.sqlite
  ```
- **Remove Windows Startup Daemon:** Delete `Limitless-OmniRoute-Launcher.vbs` from:
  `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`
- **Stop Linux / macOS Background Daemon:**
  ```bash
  pkill -f "omniroute serve"
  ```

---

## 14. Testing, Limitations, Known Unverified Areas & License

### Automated Test Suite
Run the isolated test suite:
```bash
npm test
```
The test suite covers:
- **WAL-consistent backup & restore** verification using SQLite `quick_check`.
- **Atomic transaction rollback** on simulated failures.
- **Idempotency** across repeated setup runs.
- **API key permission preservation** (never broadening restricted keys to `'all'`).
- **Pattern matching resolution** (ensuring specific patterns like `*opusplan*` and `*opus[1m]*` take precedence over generic `*opus*`).
- **Launcher generation** for Windows (.bat, .vbs) and Unix (.sh).
- **Graceful error exits** on empty catalogs or schema incompatibilities.
- **Strict isolation** from your live database, startup directory, and environment.

### Limitations & Known Unverified Areas
1. **Third-Party Rate Limits:** Upstream providers may alter rate limits, context windows, or tool support without notice.
2. **Paid Model Opt-In:** Set `LIMITLESS_EXCLUDE_PAID=true` if you wish to strictly avoid any paid model endpoints (e.g., Mistral Codestral or OpenRouter paid candidates).
3. **Live Billing Smoke Test:** Standard tests run in mock isolation; we do not charge tokens or issue paid requests to external providers during test execution.

### Contribution Guidance
Pull requests are welcome! Please ensure all changes:
1. Preserve existing combos, routing strategies, and model order.
2. Run in complete isolation without mutating live databases or writing outside temp directories.
3. Pass `npm test` with 100% green checks.

### License
MIT © [Mahaveer Singh Gehlot](https://github.com/mahik504)
