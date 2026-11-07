# Changelog

All notable changes to the Limitless Claude project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [8.3.0] - 2026-11-08

### Security
- **Dynamic Credential Resolution**: Removed hardcoded API key fallbacks from `scripts/verify-combos.js` and `scripts/benchmark.js`. Keys are now resolved dynamically from SQLite using `findTargetApiKey` with fail-closed error handling.
- **Safe Key Masking**: Truncated secret displays in verification reports and benchmark logs (`sk-***...[redacted]`).
- **Non-Destructive Installers**: Replaced `git reset --hard` in `install.ps1` and `install.sh` with working tree dirty checks (`git status --porcelain`). Installers now refuse to overwrite modified files unless explicitly passed `-Force`.
- **Fail-Closed Zero-Marginal Billing**: Enforced `allowUnknown = false` in `src/core/routing-policy.js` under `--free-only` mode, preventing unmetered commercial models from leaking into zero-cost combos.
- **WAL-Safe SQLite Backups**: Removed unsafe raw file copy fallbacks during database snapshots in `src/core/config-manager.js`, ensuring all writes are checkpointed before backup promotion.

### Fixed
- **Model Registry Alias Export**: Exported `defaultModelRegistry` in `src/core/model-registry.js` to resolve an unhandled import error in `src/core/fallback-engine.js`.
- **Benchmark Engine Task Resolution**: Fixed task lookup and expected token scoring in `src/core/benchmark-engine.js` and `scripts/benchmark.js` so live benchmarks execute cleanly against local endpoints.
- **Context Size Ceiling & Cursor Rules Directory**: Added 50KB context file size cap in `src/core/prompt-engine.js` and added recursive scanning for `.cursor/rules` (`.md` and `.mdc` rule files).
- **Diagnostic Doctor Checkpoints**: Enhanced `scripts/doctor.js` with `PRAGMA quick_check(1)` verification, table counting, and explicit `[NOT_TESTED]` state handling for dependent checks when offline.

### Changed
- **Architectural Truth Realignment**: Documented Limitless Claude as the Developer Control Plane and Policy Companion above the OmniRoute Execution Gateway, clarifying that coding clients connect directly to port 20128 while Limitless Claude manages tiers, prompts, pinning, and safety.
- **Tri-Layer Financial Accounting**: Split telemetry metrics in `src/core/token-tracker.js` and `scripts/stats.js` into three explicit layers: Actual Billed Cost to You, Estimated Upstream Cost, and Counterfactual Anthropic Value.

## [8.2.1] - 2026-11-08

### Changed
- Orchestra sync calls `ow-sync --apply` instead of copying `CLAUDE.md` and skill folders by hand.
- The adapter reads `VERSION` from the Orchestra checkout. A host file counts as synced when it contains `Orchestra <major.minor>` or the orchestra marker.
- `limitless orchestra status` prints that version.

## [8.0.0] - 2026-11-07

### Added
- **Standalone First Architecture (Mode A vs Mode B)**: Complete independence from external frameworks (Orchestra). Core runtime in `src/core/*` operates with zero external imports. Auto-discovers standard project instruction files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`).
- **Original 5-Layer Prompt Engine (`src/core/prompt-engine.js`)**: Dynamic composition across Universal Constitution (Layer 1), Task Capability Profiles (Layer 2), Provider Adapters (Layer 3), Project Context (Layer 4), and Tool Contracts (Layer 5) with delimiter escaping and prompt injection defenses.
- **Prompt Laboratory (`src/core/prompt-lab.js`)**: Fixture-based regression testing suite evaluating prompt variants against standardized coding fixtures (syntax repair, PostgreSQL RLS, Three.js `.dispose()`, hostile secret audit) with automated regression halting.
- **Bidirectional Protocol & Tool Translation (`src/core/agent-client.js`)**: Full translation between Anthropic Messages API (`tools`, `tool_use`, `tool_result`, `input_schema`) and OpenAI Chat API (`tools: [{type: 'function'}]`, `tool_calls`, `role: 'tool'`, `parameters`) with streaming SSE chunk normalization.
- **Truth-in-Model Intelligence**: Formal 6-stage lifecycle (`DISCOVERED`, `ESTIMATED`, `SMOKE_TESTED`, `TOOL_TESTED`, `BENCHMARKED`, `PRODUCTION_APPROVED`). Replaced heuristic score fabrication with strict separation of heuristic priors from empirical benchmark scores.
- **Fine-Grained Billing & Quota Safety (`src/core/billing-classifier.js`)**: 7 billing classes (`provider_free_quota`, `subscription-entitled`, `promotional`, `paid-token`, `pay-as-you-go`, `local`, `unknown`). Unknown costs return `unknown` (never `$0.00`). Free-only mode strictly excludes unmetered commercial endpoints.
- **OpenRouter Quota Intelligence & Token Capacity Calculator (`src/core/capacity-calculator.js`)**: Full documentation of OpenRouter's $10 deposit unlocking 1,000 req/day on `:free` models (verified November 2026) with concrete daily token capacity calculator across micro-patch, feature, and architecture workloads.
- **Context & Session Intelligence (`src/core/session-manager.js`, `src/core/context-manager.js`)**: Multi-turn session tracking, atomic turn checkpoints with rollback, and sliding-window compaction preserving essential tool state while pruning verbose command output.
- **Universal Global CLI Expansion (`bin/limitless.js`)**: 18 specialized commands including `limitless doctor` (15-point diagnostic), `init` (zero-config setup), `status`, `verify`, `discover`, `models list/inspect`, `providers list/test`, `budget`, `prompt list/compose/test`, `benchmark`, `acceptance`, `rollback`, and `launcher`.
- **Optional Orchestra Interoperability (`src/integrations/orchestra/`)**: Decoupled contract consumer adapter that maps Orchestra task categories to Limitless capabilities, with zero core coupling and safe standalone fallback.
- **Comprehensive Audit Suite**: Published `AUDIT.md`, `ARCHITECTURE-REVIEW.md`, `TECHNICAL-DEBT.md`, `KNOWN-ISSUES.md`, `IMPROVEMENT-ROADMAP.md`, `docs/COMPETITOR-ANALYSIS.md`, and `docs/STANDALONE-VERIFICATION.md`.

### Fixed
- Fixed SQLite raw file copying during snapshots: `src/core/config-manager.js` now executes WAL-safe atomic backups via `src/omniroute/db.js` (`VACUUM INTO` and clean WAL checkpoints).
- Fixed billing classifier risk where unknown model costs reported `$0.00`.
- Fixed heuristic capability evaluator which previously fabricated empirical scores based on model name strings.

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
