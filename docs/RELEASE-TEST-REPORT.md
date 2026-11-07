# Limitless Claude 7.0.0 — Automated Test Report

**Execution Date:** 2026-11-07  
**Test Engine:** Node.js Native Test Runner (`node --test test/*.test.js`)  
**Runtime:** Node.js v24.19.0 (Win32 x64)  
**Total Tests:** 68  
**Suites:** 5  
**Passed:** 68  
**Failed:** 0  
**Skipped:** 0  
**Execution Duration:** 3,247 ms  

---

## 1. Test Suite Summary

| Suite Name | File | Tests | Pass | Fail | Duration |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **SQLite Driver Adapter & WAL-Safe Backup** | `test/db.test.js` | 8 | 8 | 0 | 120 ms |
| **Model & Provider Discovery Script** | `test/discover.test.js` | 6 | 6 | 0 | 655 ms |
| **OmniRoute API Key Permission Safety** | `test/permissions.test.js` | 14 | 14 | 0 | 142 ms |
| **Limitless Claude Setup Integrity** | `test/setup.test.js` | 28 | 28 | 0 | 3,134 ms |
| **Limitless Claude 7.0 Core Intelligence** | `test/v7-core.test.js` | 12 | 12 | 0 | 16 ms |
| **Total** | | **68** | **68** | **0** | **~3.2 s** |

---

## 2. Detailed Test Cases & Verifications

### Suite 1: SQLite Driver Adapter & WAL-Safe Backup (`test/db.test.js`)
* `[PASS]` should create WAL-mode database and perform uncheckpointed writes
* `[PASS]` should restore and verify WAL-consistent backup in isolated environment
* `[PASS]` should properly commit successful transactions and rollback on failure
* `[PASS]` should safely use checkpoint-and-copy fallback when VACUUM INTO fails
* `[PASS]` should fail safely and preserve existing backup when WAL checkpoint is busy or fails
* `[PASS]` should fail candidate verification if candidate file has missing tables or rows compared to source
* `[PASS]` should safely preserve and restore existing backup if candidate promotion fails
* `[PASS]` should clean up partial target file and restore intact previous backup if promotion copy fails partway

### Suite 2: Model & Provider Discovery Script (`test/discover.test.js`)
* `[PASS]` should discover providers and live models successfully when gateway is active
* `[PASS]` should preserve provider inventory but exit with nonzero code if live gateway HTTP request fails
* `[PASS]` should preserve provider inventory but exit with nonzero code if no API key is available
* `[PASS]` should exit with nonzero code if database does not exist
* `[PASS]` should warn that existing model inventory is not evidence of fresh scan when live discovery fails
* `[PASS]` should print help message and exit cleanly without requiring or touching database when --help is passed

### Suite 3: OmniRoute API Key Permission Safety (`test/permissions.test.js`)
* `[PASS]` should prefer explicit key if requested
* `[PASS]` should select most active non-revoked key when no explicit key requested
* `[PASS]` should preserve restricted mode and existing allowed_models when adding combos
* `[PASS]` should not make changes if key already has full combo access or wildcard
* `[PASS]` should be idempotent when called multiple times on the same key
* `[PASS]` should reject inactive, revoked, or banned keys
* `[PASS]` should fail-closed with diagnostic when restricted key exists in schema lacking allowed_combos
* `[PASS]` should safely repair and handle malformed JSON in allowed_combos without crashing
* `[PASS]` should handle minimal schema with only key column
* `[PASS]` should reject an explicit key if it is expired
* `[PASS]` should not select arbitrary key when API key query encounters an error and should fail safely returning null
* `[PASS]` should distinguish harmless already-authorized keys from incomplete restricted keys on unsupported schema
* `[PASS]` should safely return null when explicit key query encounters a database error
* `[PASS]` should support dryRun option without modifying database allowed_combos

### Suite 4: Limitless Claude Setup Integrity (`test/setup.test.js`)
* `[PASS]` should execute setup.js without crashing and handle transactions safely
* `[PASS]` should verify backup validity and restore cleanly in isolation
* `[PASS]` should output tier-configuration.json accurately and preserve existing fields
* `[PASS]` should properly persist combos in the database without dropping the models array
* `[PASS]` should not inject fake identities in system prompts
* `[PASS]` should preserve unrelated combos and mappings
* `[PASS]` should update restricted API key permissions without broadening to 'all'
* `[PASS]` should verify mapping routes and priorities
* `[PASS]` should generate Windows and Unix launchers in isolated directory with correct quoting and retry loop
* `[PASS]` should resolve model aliases correctly according to OmniRoute's exact mapping semantics
* `[PASS]` should enforce paid-model safety guard when LIMITLESS_EXCLUDE_PAID is set
* `[PASS]` should accurately classify model billing categories
* `[PASS]` should enforce paid-model safety guard when --exclude-paid CLI argument is passed
* `[PASS]` should promote opusplan priority to 11 when migrating an existing database snapshot
* `[PASS]` should be fully idempotent when run repeatedly
* `[PASS]` should fail gracefully on incompatible database schema
* `[PASS]` should exit with nonzero code if no candidate models match
* `[PASS]` should fail safely with nonzero code and NOT mutate database when live catalog fetch fails and offline cache is not opted in
* `[PASS]` should discover models from live OmniRoute gateway and configure combos without requiring offline cache opt-in
* `[PASS]` should fail safely and exit with nonzero code when live OmniRoute gateway returns HTTP 500 error
* `[PASS]` should fail safely and exit with nonzero code when live gateway returns empty models array without offline cache opt-in
* `[PASS]` should abort safely before transaction on fresh setup when paid-model guard produces an empty tier while other tiers have candidates
* `[PASS]` should not destroy previously working tier by replacing it with an empty list
* `[PASS]` should fail setup and exit with nonzero code when restricted key cannot receive combo permissions due to missing allowed_combos column
* `[PASS]` should succeed when key is in 'all' mode even if schema lacks allowed_combos column (harmless already-authorized case)
* `[PASS]` should not mutate api_keys during preflight check if setup aborts before transaction
* `[PASS]` should dynamically discover and classify arbitrary custom providers and models into 4 tiers at runtime
* `[PASS]` should print help message and exit cleanly without requiring or touching database when --help is passed

### Suite 5: Limitless Claude 7.0 Core Intelligence (`test/v7-core.test.js`)
* `[PASS]` Redaction Utility - should properly mask API keys and redact secrets
* `[PASS]` BillingClassifier - should categorize models into correct billing tiers
* `[PASS]` CapabilityEvaluator - should map models to capability profiles accurately
* `[PASS]` ModelRegistry - should track lifecycle stages and health transitions
* `[PASS]` ProviderRegistry - should manage provider health and rate limiting
* `[PASS]` RoutingPolicy & CircuitBreaker - should trip on consecutive failures and deprecations
* `[PASS]` FallbackEngine - should detect upstream deprecation patterns
* `[PASS]` AgentClientManager - should accurately detect client types and adapt payloads
* `[PASS]` ConfigManager - should manage snapshots and scoped process environments
* `[PASS]` BenchmarkEngine - should evaluate task token matching accurately
* `[PASS]` Provider Profiles Registry - should export all 6 profiles with valid verify handlers
* `[PASS]` TelemetryEngine - should safely handle null or empty database

---

## 3. Live Combo Verification Test (`npm run verify`)
* **Endpoint:** `http://localhost:20128`
* **Target Mappings & Combos Tested:** 8
* **Passed:** 8
* **Failed:** 0
* **Latencies Recorded:**
  - Haiku Alias (`claude-haiku-4-5`): **0.60s** (HTTP 200 "PONG")
  - Sonnet Alias (`claude-sonnet-5`): **2.57s** (HTTP 200 "PONG")
  - Opus Alias (`claude-opus-4-8`): **0.83s** (HTTP 200 "PONG")
  - Fable Alias (`claude-fable-5-1`): **2.56s** (HTTP 200 "PONG")
  - Direct Haiku Combo (`combo/limitless-haiku`): **0.66s** (HTTP 200 "PONG")
  - Direct Sonnet Combo (`combo/limitless-sonnet`): **2.77s** (HTTP 200 "PONG")
  - Direct Opus Combo (`combo/limitless-opus`): **0.72s** (HTTP 200 "PONG")
  - Direct Fable Combo (`combo/limitless-fable`): **2.69s** (HTTP 200 "PONG")
