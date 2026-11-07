# Limitless Claude 7.0.0 — Configuration Safety & Profile Audit Report

This report audits configuration modification risks, environment isolation, secret redaction, and disaster recovery mechanisms implemented in Limitless Claude 7.0.0.

---

## 1. Global Mutation Audit & Mitigation

In prior versions (v6.1.0 and earlier), running setup executed Windows `setx` commands that wrote `ANTHROPIC_BASE_URL` globally into the Windows user registry. This caused conflicts when developers attempted to run native Claude Code or other tools.

### Limitless Claude 7.0 Mitigations:
1. **Scoped Process Launcher (`scripts/launcher.js`):**
   Spawns Claude Code child processes with scoped environment variables (`ANTHROPIC_BASE_URL=http://127.0.0.1:20128`) without writing to the user registry.
2. **Conflict Detection (`src/core/config-manager.js`):**
   Audits both `process.env` and `~/.claude/settings.json`. If `ANTHROPIC_BASE_URL` points to an unintended external IP or port, it is flagged as a conflict on the dashboard.
3. **Explicit Profile Switching (`scripts/switch-profile.js`):**
   Creates an automatic pre-switch snapshot before modifying `~/.claude/settings.json`, guaranteeing an instant rollback path.
4. **Dry-Run Modes:**
   Supported across `setup.js` (`--dry-run`), `switch-profile.js` (`--dry-run`), and `rollback.js` (`--dry-run`).

---

## 2. Supported Configuration Profiles

| Profile Name | Target Base URL | Auth Mechanism | Intended Use Case |
| :--- | :--- | :--- | :--- |
| **`limitless`** | `http://127.0.0.1:20128` | Local OmniRoute Key | Multi-provider intelligent routing combos (default) |
| **`native`** | `https://api.anthropic.com` | Official Anthropic Key | Direct Anthropic API access without proxying |
| **`opencode-go`** | `https://api.opencode.ai/v1` | OpenCode Bearer Key | Flat subscription-entitled inference pool |
| **`opencode-zen`** | `https://zen.opencode.ai/v1` | Metered Bearer Key | Pay-as-you-go router with budget metering |
| **`openrouter`** | `https://openrouter.ai/api/v1` | OpenRouter API Key | 50/day free models or $10-funded wholesale tier |
| **`antigravity`** | `http://127.0.0.1:20128` | Local OAuth Proxy | Google One AI OAuth with deprecation safeguards |

---

## 3. Secret Redaction Audit

All telemetry, CLI outputs, and logs are filtered through [`src/utils/redact.js`](file:///C:/projects/limitless-claude/src/utils/redact.js):
- **API Keys:** End-masked showing only 3 characters at start and end: `sk-...def` or `sk-ant...cdef`.
- **Bearer Tokens:** Stripped and replaced with `[REDACTED]`.
- **Auth Headers:** Filtered from request metadata in telemetry reports.
- **Git Hygiene:** Backups (`backups/`) and database snapshots (`*.bak`) are ignored by `.gitignore`.
