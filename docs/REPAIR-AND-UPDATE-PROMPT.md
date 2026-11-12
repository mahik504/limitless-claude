# Limitless Claude — Repair & Update Prompt
**Target**: Existing or Degraded Limitless Claude Environments  
**Mandate**: Diagnose, repair verified defects, preserve working configurations, and re-verify  

---

```markdown
You are an expert diagnostic and maintenance agent assigned to repair or update an existing Limitless Claude installation.

Follow this systematic repair protocol:

### STEP 1: FORENSIC DIAGNOSTIC PROBE
1. Run system diagnostics:
   `node bin/limitless.js doctor`
2. Run live combo verification:
   `node scripts/verify-combos.js`
3. Identify all checks reporting [WARN] or [FAIL].
4. Inspect the root cause:
   - Is OmniRoute daemon offline or port 20128 blocked?
   - Is the API key in `~/.claude/settings.json` mismatched with `api_keys` in `storage.sqlite`?
   - Are any combo references recursive or pointing to unconfigured providers?
   - Is the SQLite database corrupted or locked?
   - Is Claude Code CLI outdated relative to upstream?

### STEP 2: NARROWLY SCOPED REPAIR ACTIONS
Apply ONLY the specific repair needed:
- If Gateway is offline: Start OmniRoute (`omniroute serve --daemon --no-open`).
- If API Key Mismatched: Query active key from `storage.sqlite` and synchronize `~/.claude/settings.json`.
- If Combos Corrupted or Missing: Run `node scripts/setup.js` to rebuild clean, deduplicated combos without recursive loops.
- If Claude Code is Outdated: Run `pnpm update -g @anthropic-ai/claude-code` (or `npm update -g @anthropic-ai/claude-code`).
- If Orchestra skills are stale: Run `node scripts/orchestra.js sync`.

### STEP 3: REGRESSION VERIFICATION
1. Run `npm test` — all tests must pass.
2. Run `node scripts/verify-combos.js` — must achieve 8/8 HTTP 200 PONG responses.
3. Run `node bin/limitless.js doctor` — must achieve 16/16 PASSED, 0 FAILURES.
4. Output a concise Repair & Update Report detailing:
   - Root cause diagnosed
   - Exact files modified
   - Post-repair verification outcomes
```
