# Changelog

All notable changes to the Limitless Claude project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [8.5.0] - 2026-11-13

### Added
- **Official Model-Appropriate System Prompts**: Embedded authentic leaked cognitive directives from Anthropic's flagship models directly into the `system_message` and `data` JSON blob for all 6 tiers:
  - Opus 5.5 (`combo/limitless-opus`): Massive reasoning, complex architecture, multi-file agentic loops, strict zero-stub policy, `<antml:reasoning_effort>10</antml:reasoning_effort>`.
  - Sonnet 5.5 (`combo/limitless-sonnet`): Architectural planning, flaw hunting, chain-of-thought analysis, decisive recommendations, `<antml:reasoning_effort>5</antml:reasoning_effort>`.
  - Haiku 5.5 (`combo/limitless-haiku`): Sub-second syntax verification, concise diffs, proactive tool invocation, `<antml:reasoning_effort>1</antml:reasoning_effort>`.
  - Fable 5.2 (`combo/limitless-fable`): Frontier cross-repository synthesis, auto-thinking mode (`<antml:thinking_mode>auto</antml:thinking_mode>`), authorized dual-use security research.
  - Claude Desktop Chat (`combo/desktop-chat`): Conversational leadership, decisive guidance, epistemic honesty, Imagine design system artifacts.
  - Claude Desktop Cowork (`combo/desktop-cowork`): Autonomous knowledge worker powered by Claude Agent SDK, mid-chain silence discipline, proactive tool execution.
- **In-Depth Measured Competitor Matrix**: Source-verified comparison of Limitless Claude against Real Claude Code CLI, Gemini CLI, OpenCode, OpenClaw, Hermes Agent, Aider, and Cline, detailing the closure of the 8-point gap to 100/100.
- **Two Complete Installation Prompts**: Added copy-pasteable Clean Installation Prompt (`docs/CLEAN-INSTALL-PROMPT.md`) and Repair & Update Prompt (`docs/REPAIR-AND-UPDATE-PROMPT.md`) with capacity and quota stacking tips.

### Fixed
- **Multi-Turn Latency Freezes**: Fixed cascading timeout bottlenecks by migrating all 6 combos from round-robin to strict priority routing (`strategy: "priority"`). Pinned fast primary models (`github/gpt-4o-2024-11-20`, `mistral/codestral-latest`, `github/gpt-4o-mini`) at priority index 0, bringing multi-turn turn latencies down to 1.2s - 2.7s with zero freezing.
- **UTF-16LE Environment Corruption**: Repaired `~/.omniroute/.env` where `COMBO_CATALOG_ENABLED=true` had been appended with UTF-16LE null bytes, restoring valid UTF-8 encoding across the runtime.
- **Claude Desktop Third-Party Gateway**: Integrated native `configLibrary` gateway mode with `modelDiscoveryEnabled: false` to eliminate UI freezing from 2,700+ discovered models.

### Removed
- **Legacy Unmaintained Routes**: Purged `claude-tutor` and `claude-convoz` from `storage.sqlite` (`model_combo_mappings`), Claude Desktop `inferenceModels`, `~/.claude/settings.json`, and prompt engine mappings.
- **Obsolete Documentation**: Deleted deprecated v7 documentation (`ORCHESTRA-4.1.0-COMPATIBILITY.md`, `LIMITLESS-CLAUDE-7.0.0-LOCAL-VERIFICATION.md`, `RELEASE-NOTES-v7.0.0.md`, `RELEASE-MIGRATION.md`, `RELEASE-ROLLBACK.md`, `RELEASE-TEST-REPORT.md`, `ROLLBACK.md`).

---

## [8.4.0] - 2026-11-13

### Added
- **Claude Desktop Third-Party Gateway Integration**: Full support for native Claude Desktop Third-Party inference mode (`Claude-3p/configLibrary`), `jo(e)` validator compliance, and MCP synchronization.
- **Dedicated Desktop Combos**: Implemented `combo/desktop-chat` for fast prose and `combo/desktop-cowork` for strict Anthropic XML `tool_use` execution.
- **Universal Master Install Prompt**: Created self-executing agent installer prompt in `docs/MASTER-INSTALL-PROMPT.md`.
- **OpenRouter $10 Multiplier Integration**: Formally integrated 1,000 req/day capacity policy on `:free` models.
- **Expanded Capability Engine**: 24 modular workload profiles in `prompts/capabilities/`.

### Fixed
- **P0 Security Hardening**: Completely eliminated raw API key leaks via Windows `setx`.
- **Gateway Persistence Watchdog**: Re-engineered `omniroute-daemon.bat` with auto-recovery loops and universal binary discovery.

---

## [8.3.0] - 2026-11-07
- Architectural hardening and policy plane realignment.
- Isolated deprecated Google Cloud Code internal models.

---

## [8.2.0] - 2026-11-07
- Interactive Terminal TUI with real-time latency graphs.
- Three-layer token and financial savings telemetry.
- Standby Ollama auto-discovery on port 11434.

---

## [8.1.0] - 2026-11-07
- Task-to-Model Pinning Engine (`limitless pin`).
- Granular File Checkpoint and Undo Engine (`limitless undo`).

---

## [8.0.0] - 2026-11-07
- Initial autonomous multi-provider coding agent control plane release.
