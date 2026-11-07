# Limitless Claude Technical Debt Register
*Baseline: 7.0.0 | Target: 8.0.0*

---

## Technical Debt Items

### TD-01: Heuristic Capability Scoring
- **Location**: `src/core/capability-evaluator.js`
- **Description**: Default score fallback to `7.5` and regex boosts (`coder`, `opus`, `70b`).
- **Remediation in 8.0**: Formal 6-stage lifecycle (`DISCOVERED`, `ESTIMATED`, `SMOKE_TESTED`, `TOOL_TESTED`, `BENCHMARKED`, `PRODUCTION_APPROVED`). Strict separation of heuristic priors from empirical scores.

### TD-02: Flawed Free-Tier Assumptions & $0.00 Fallbacks
- **Location**: `src/core/billing-classifier.js`
- **Description**: Blanket zero-cost classification for provider names; unknown pricing returns `$0.00`.
- **Remediation in 8.0**: Granular 7-class taxonomy (`provider_free_quota`, `subscription-entitled`, `promotional`, `paid-token`, `pay-as-you-go`, `local`, `unknown`). Unknown costs return `{ cost: null, status: 'unknown' }`.

### TD-03: Raw File Copying of SQLite in WAL Mode
- **Location**: `src/core/config-manager.js`
- **Description**: `createSnapshot()` copies `storage.sqlite` directly with `fs.copyFileSync`.
- **Remediation in 8.0**: Use `backupDatabase()` in `src/omniroute/db.js` executing `VACUUM INTO` or atomic WAL checkpoints.

### TD-04: Incomplete Protocol & Tool Translation
- **Location**: `src/core/agent-client.js`
- **Description**: Only top-level `system` property is handled; tool definitions, tool calls, and streaming SSE are not converted.
- **Remediation in 8.0**: Comprehensive bidirectional Anthropic Messages $\leftrightarrow$ OpenAI Chat translator for schemas, calls, results, and streaming events.

### TD-05: Monolithic Static System Prompts
- **Location**: `scripts/setup.js` & `src/profiles/limitless.js`
- **Description**: Combos embed static system messages with no task adaptation or prompt injection protection.
- **Remediation in 8.0**: Original 5-Layer Prompt Engine (`src/core/prompt-engine.js`) and modular `prompts/` catalog.

### TD-06: Missing Context Compaction & Session Tracking
- **Location**: Core engine lacks dedicated context manager.
- **Description**: Long agent conversations cause token exhaustion on upstreams.
- **Remediation in 8.0**: Implement `src/core/session-manager.js` and `src/core/context-manager.js`.

### TD-07: Narrow CLI Command Surface
- **Location**: `bin/limitless.js`
- **Description**: Only 8 commands supported; missing diagnostics (`doctor`), onboarding (`init`), and model introspection.
- **Remediation in 8.0**: Expand CLI with full subcommand set.
