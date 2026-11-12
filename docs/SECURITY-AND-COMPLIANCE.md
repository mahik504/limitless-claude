# Limitless Claude — Security, Privacy & Provider Compliance Standard
**Document Scope**: Cryptographic Storage, API Key Redaction, Localhost Security & Provider Compliance  
**Audience**: Security Auditors, Developers & Enterprise Compliance Teams  
**Document Revision**: November 2026  

---

## 1. Zero-Exposure Credential Architecture

Security and credential preservation are foundational requirements of Limitless Claude:

### A. At-Rest Encryption
- All provider refresh tokens, OAuth client secrets, and upstream API keys stored in OmniRoute's SQLite database (`storage.sqlite`) are encrypted at rest using AES-256-GCM via `STORAGE_ENCRYPTION_KEY` configured in `~/.omniroute/.env`.
- Plaintext credentials are never written to disk by Limitless Claude scripts or configuration generators.

### B. In-Transit Redaction (`src/utils/redact.js`)
- All CLI utilities, diagnostic commands (`limitless doctor`, `limitless status`), terminal logs, and test suites route text output through the universal redaction utility.
- API keys, OAuth bearer tokens, and hex secrets matching patterns (`sk-ant-...`, `sk-or-...`, `ghp_...`, `Bearer ...`) are automatically masked (e.g. `sk-ant-...62127e`).
- Raw credentials are never output in error stack traces or terminal output.

### C. Git & Commit Hygiene
- `~/.claude/settings.json`, `.omniroute/`, and `.env` files are strictly excluded via `.gitignore`.
- Version control history is audited to guarantee zero API keys or secrets are committed.

---

## 2. Localhost Network Security & Interface Binding

During our forensic audit of the live OmniRoute server, the following security alert was verified:
`⚠ SECURITY: listening on 0.0.0.0 with NO API-key requirement — the inference plane (/v1/*) is reachable by ANY device that can route to this host`

### Recommended Localhost Hardening
On untrusted or public local area networks (e.g., shared office Wi-Fi), developers should enforce loopback interface binding:
1. In `~/.omniroute/.env`:
   ```bash
   # Bind strictly to local loopback (127.0.0.1) instead of all interfaces (0.0.0.0)
   OMNIROUTE_SERVER_HOST=127.0.0.1

   # Enforce API key verification for all incoming inference requests
   REQUIRE_API_KEY=true
   ```
2. Limitless Claude scripts default strictly to `http://127.0.0.1:20128`, preventing network exposure.

---

## 3. Provider Compliance & Account Hygiene Rules

Limitless Claude enforces strict ethical and legal compliance with all upstream model providers:
1. **No Rate-Limit Evasion**: Limitless Claude does not implement IP rotation, rotating proxies, or stealth headers designed to bypass provider anti-bot or rate-limit protections.
2. **No Fake Identity Generation**: Multi-account support is designed solely for developers who maintain multiple legitimate, authorized accounts (e.g., personal vs work Google Cloud projects). Disposable email generation and scripted account farming are strictly rejected.
3. **Transparent Upstream Attribution**: When requests are dispatched, attribution headers clearly identify the client harness and do not spoof prohibited identities.
4. **Honest Quota Reporting**: Documentation explicitly distinguishes verified provider quota policies (e.g., OpenRouter $10 deposit for 1,000 free reqs/day) from speculative claims.

---

## 4. Supply Chain & Dependency Security

- **Minimal Dependency Surface**: The core Limitless Claude package (`package.json`) relies exclusively on Node.js built-in modules (`node:test`, `node:assert`, `node:sqlite`, `node:crypto`, `node:fs`, `node:path`) with only one optional native dependency (`better-sqlite3`).
- **Zero Third-Party Telemetry**: Limitless Claude contains zero phone-home tracking, analytics pings, or telemetry beacons. All telemetry data is written locally to `storage.sqlite`.
- **Node.js Engine Enforcement**: Strictly requires Node.js `>= 22` to leverage built-in cryptographic security and modern standard libraries.
