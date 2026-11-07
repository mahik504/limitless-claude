# Limitless Claude 7.0.0 — Release Migration Guide

This guide details the procedure for upgrading from Limitless Claude 6.x to 7.0.0 without downtime, configuration loss, or environment variable conflicts.

---

## 1. Upgrade Architecture Summary

Limitless Claude 7.0.0 introduces modular intelligence engines without modifying OmniRoute's core SQLite database schema. Existing `combos`, `model_combo_mappings`, `provider_connections`, and `api_keys` remain fully preserved and backwards-compatible.

### What Gets Upgraded
1. **Tier Re-ordering:** `limitless-haiku` and `limitless-fable` combos are updated so verified, zero-deprecation models occupy Index 0 (`cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `kiro/claude-sonnet-4.5`).
2. **System Prompts:** Unsupported pseudo-XML tags (`<antml:...>`) are cleanly removed; functional zero-stub instructions and exact file:line coordinates are preserved.
3. **Core Subsystems:** Adds `src/core/` (billing, capability, circuit breakers, fallback, agent client, config manager, telemetry, benchmarks).
4. **CLI Tools:** Adds `switch-profile.js`, `launcher.js`, `rollback.js`, `dashboard.js`, and `benchmark.js`.

---

## 2. Step-by-Step Migration Instructions

### Step 1: Pre-Migration Backup Snapshot
Create an atomic snapshot of current configurations:
```powershell
node -e "const { defaultConfigManager } = require('./src/core/config-manager'); console.log('Snapshot:', defaultConfigManager.createSnapshot('pre-v7-migration'));"
```

### Step 2: Install Updated Dependencies
```powershell
npm install
```

### Step 3: Run Setup Script
```powershell
npm run setup
```
This performs a WAL-consistent database transaction:
- Re-orders candidate models to place ultra-fast zero-marginal-cost models first.
- Injects provider-neutral system instructions.
- Writes metadata to `config/tier-configuration.json`.
- Configures `~/.claude/settings.json`.

### Step 4: Verify Live Routing & Combos
```powershell
npm run verify
```
Confirm that all 8 tests return `HTTP 200` with response times `< 3.0s`.

### Step 5: Test Scoped Execution
```powershell
npm run launcher -- --print "Verify 7.0.0 upgrade"
```

---

## 3. Post-Migration Verification Checklist

- [x] OmniRoute daemon listening on `127.0.0.1:20128`.
- [x] Haiku responds in `< 1.0s` without Antigravity deprecation notices.
- [x] `npm test` runs with 68/68 passing tests.
- [x] `npm run dashboard` displays connected database and active combos.
- [x] Rollback snapshot confirmed in `backups/` directory.
