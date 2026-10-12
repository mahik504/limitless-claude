# Testing, Integrity & Verification Guide

Limitless Claude includes an automated test suite executed with Node's native test runner (`node:test`). Tests run in strict isolation to ensure your production OmniRoute configuration, startup folder, and database are never altered or touched during CI or local testing.

---

## 1. Automated Test Suite

Run the full automated test suite:

```bash
npm test
```

### Test Coverage Areas

1. **Setup Integrity (`test/setup.test.js`)**:
   - Atomic database transactions with rollback on simulated failure.
   - Idempotency when running setup repeatedly.
   - Preservation of unrelated database records in `combos` and `model_combo_mappings`.
   - Preservation of existing benchmark data in `tier-configuration.json`.
   - Payload regression guards (guaranteeing `models` arrays and strategy types are preserved).
   - Prompt safety (verifying no fabricated Anthropic identities are injected).
   - Incompatible database schema detection and graceful nonzero exit.
   - Nonzero exit when candidate models catalog is empty.

2. **SQLite Driver & WAL Consistency (`test/db.test.js`)**:
   - Cross-platform driver abstraction (`better-sqlite3` or native `node:sqlite`).
   - SQLite Write-Ahead Logging (`WAL`) mode uncheckpointed transactions backup.
   - Validation that `storage.sqlite.bak` is verified using SQLite `quick_check`.
   - Transaction rollback ensuring zero partially applied rows.

3. **API Key Permission Safety (`test/permissions.test.js`)**:
   - Verification that restricted keys preserve `model_access_mode = 'restricted'`.
   - Ensuring `allowed_models` is never modified or cleared.
   - Safely appending only missing Limitless combos to `allowed_combos`.
   - Idempotency when checking already permitted keys.
   - Key selection logic (honoring `OMNIROUTE_API_KEY` and most active key).

4. **Model and Provider Discovery (`test/discover.test.js`)**:
   - Scanning provider connections from SQLite database.
   - Recording `last_scanned` metadata rather than claiming unverified live status.
   - Testing against mock endpoints to prevent touching the live port 20128.

---

## 2. Test Isolation Architecture

To ensure zero risk to your operating environment:
- **Mock Database Directory:** Tests set `OMNIROUTE_DIR` to a temporary directory in `os.tmpdir()`.
- **Mock Startup Directory:** Tests set `TEST_STARTUP_DIR` so Windows Startup entries are never modified during test runs.
- **Mock Gateway Port:** Tests configure `OMNIROUTE_BASE_URL` to an isolated mock port to prevent issuing requests to your live OmniRoute instance.

---

## 3. Manual Live Integration Smoke Test

Because live API calls consume rate limits and token allowances, live client tests are not automated in standard CI. Use this checklist to verify your end-to-end integration:

1. **Verify OmniRoute Gateway:**
   - Confirm OmniRoute is running: `curl http://127.0.0.1:20128` (returns HTTP 200).
   - Check authenticated providers in the web UI: `http://localhost:20128`.

2. **Verify Claude Code CLI in Terminal:**
   - Start Claude Code:
     ```bash
     claude
     ```
   - In a test directory, issue a prompt: `Say hello`.
   - Check the OmniRoute log/console to verify the request was intercepted, routed to the configured combo, and returned successfully.

3. **Verify Model Alias Routing:**
   - Test each alias individually:
     ```bash
     claude --model limitless-haiku
     claude --model limitless-sonnet
     claude --model limitless-opus
     claude --model limitless-fable
     ```
   - Verify OmniRoute matches the corresponding combo ID for each alias.

4. **Verify Tool Execution:**
   - In Claude Code, ask: `Create a file named test_check.txt with content 'OK'`.
   - Confirm tool calling executes properly and writes the file.

5. **Verify VS Code & Cursor IDE:**
   - Open VS Code with the Claude Code extension installed.
   - Confirm requests succeed without connection errors.
   - Open Cursor terminal, run `claude`, and confirm the environment variables route to `http://localhost:20128`.

6. **Verify Windows Auto-Start Daemon:**
   - Inspect `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Limitless-OmniRoute-Launcher.vbs`.
   - Confirm it points to your current repository's `omniroute-daemon.bat`.
