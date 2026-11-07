# Changelog

All notable changes to the Limitless Claude project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [7.0.0] - 2026-11-07

### Added
- **Active Fallback & Deprecation Trap Engine (`src/core/fallback-engine.js`)**: Real-time detection of upstream HTTP 200 deprecation notices (such as Google Cloud Code PA's `"This version of Antigravity is no longer supported..."`). Automatically marks models `DEGRADED`, trips circuit breakers, and reroutes traffic in sub-second SLA.
- **Dynamic Circuit Breakers & Cooldowns (`src/core/routing-policy.js`)**: State machine (`CLOSED`, `OPEN`, `HALF_OPEN`) with a 3-strike threshold for transient errors, immediate trip on deprecation/auth errors, and exponential backoff (30s to 5m) with single-probe recovery trials.
- **Billing & Quota Classifier (`src/core/billing-classifier.js`)**: 6-tier classification (`zero-marginal-cost`, `subscription-entitled`, `paid-token`, `pay-as-you-go`, `promotional`, `local`), configurable budget guards (`--exclude-paid`), and per-turn token cost estimations.
- **Granular Capability Evaluator (`src/core/capability-evaluator.js`)**: Categorizes models across 7 capability profiles (`FAST`, `BALANCED`, `REASONING`, `FRONTEND`, `3D`, `BACKEND`, `REVIEW`).
- **Multi-Provider Profile System (`src/profiles/`)**: 6 pre-configured provider profiles (`limitless`, `native`, `opencode-go`, `opencode-zen`, `openrouter`, `antigravity`) with instant CLI switching via `npm run switch-profile <name>`.
- **Scoped Safe Launcher (`scripts/launcher.js`)**: Launch Claude Code CLI under a specific profile with isolated environment variables, eliminating global Windows registry pollution (`setx`).
- **Terminal Observability Dashboard (`scripts/dashboard.js`)**: Real-time gateway status, request counts, p50/p95 latency percentiles, input/output tokens, estimated dollar cost, and provider status with complete secret redaction.
- **Disaster Recovery & Atomic Rollback (`scripts/rollback.js`)**: WAL-safe snapshots of `storage.sqlite`, `~/.claude/settings.json`, and `.claude.json` with one-command restoration.
- **12-Task Capability Benchmark Harness (`scripts/benchmark.js`)**: Automated benchmark suite evaluating models across atomic syntax patches, multi-file refactoring, React 19 UI, Three.js 3D, and PostgreSQL RLS policies.
- **Agent Client Compatibility Layer (`src/core/agent-client.js`)**: Adapters for Claude Code CLI, Claude Code Extension, Superdesign / Open Design, Antigravity IDE, and OpenCode.
- **Comprehensive Documentation Suite**: Added `RELEASE-READINESS.md`, `CLIENT-COMPATIBILITY.md`, `MIGRATION.md`, `ROLLBACK.md`, `RELEASE-NOTES-v7.0.0.md`, and 22 Mermaid architecture diagrams in `docs/diagrams/README.md`.

### Changed
- **Candidate Model Prioritization (`scripts/setup.js`)**: Re-ordered Haiku to place ultra-fast zero-marginal-cost models (`cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `github/gpt-4o-mini`) at index 0 (0.60s latency). Re-ordered Fable to place verified frontier models (`kiro/claude-sonnet-4.5`, `kiro/deepseek-3.2`) at index 0.
- **Truthful System Instructions**: Removed unsupported pseudo-XML tags (`<antml:...>`) while preserving authoritative functional instructions, strict zero-stub rules, and exact coordinate formatting.
- **Package Version**: Upgraded to 7.0.0 with new npm scripts (`switch-profile`, `launcher`, `rollback`, `dashboard`, `benchmark`).

---

## [6.1.0] - 2026-10-23

### Added
- Strict tier quotas: Haiku (6 models), Sonnet (8 models), Opus (18 models), Fable (5 models).
- Leaked system prompt engine embedded across all combos.
- Copilot model guard restricting routes strictly to verified OpenAI endpoints.

### Fixed
- Slashing turn latencies by purging dead and congested provider endpoints (`agentrouter`, `bluesminds`).

---

## [6.0.0] - 2026-10-13

### Added
- Interleaved round-robin architecture across active providers.
- Dynamic heuristic provider discovery engine for arbitrary custom providers.
- WAL-consistent SQLite database backup and repair tools.
