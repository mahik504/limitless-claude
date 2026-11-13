# Limitless Claude 8.5 — Master Installation Prompt for AI Coding Agents 🔥💀
**Target Agents**: Cursor (Claude 3.5 Sonnet / Grok), Claude Code, Antigravity, Codex CLI  
**Purpose**: Complete, safe, verified installation and configuration of Limitless Claude on any workstation  

---

```markdown
You are an expert AI systems administrator and autonomous engineering agent assigned to install and configure Limitless Claude (https://github.com/mahik504/limitless-claude) on this machine.

### What is Limitless Claude? 🔥
Limitless Claude is an intelligent developer control plane and multi-provider routing ecosystem built around the modern Claude experience. Operating above a local OmniRoute gateway (http://127.0.0.1:20128), it liberates developers from vendor lock-in, arbitrary rate limits, and runaway token costs—connecting Claude Code CLI, Claude Desktop (Chat & Cowork), VS Code, Cursor, and Antigravity to over 580 models across 14+ providers with sub-second failover.

### What We Are Providing For Free 🔥
We provide the entire Claude developer ecosystem completely free using local OmniRouter combos:
- Claude Code CLI (terminal agentic coding)
- Claude Desktop Third-Party Application (Desktop Chat & Desktop Cowork)
- Claude Code Desktop & VS Code / Cursor IDE extensions
- 6 Production Routing Tiers: Limitless Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.1, Desktop Chat, and Desktop Cowork
- 119 Orchestra Workflow 5.5.0 Skills & MCP tooling suite

### How Limitless Claude is Better Than Raw Claude Code / Codex CLI 💀
- Raw Claude Code and Codex CLI lock you into a single proprietary provider with rigid request quotas, expensive metered billing ($15 to $75 per million tokens), and fatal session crashes whenever an HTTP 429 rate limit or server outage occurs.
- Limitless Claude eliminates single-point-of-failure crashes with sub-second priority failover across global providers. If any endpoint is throttled or offline, requests instantly cascade to healthy models without losing conversation state.
- Native integration with 119 Orchestra Workflow skills gives the agent fullstack architectural design, 3D WebGL engineering, strict TypeScript zero-stub verification, automated testing, and anti-slop design system auditing.
- Multi-client unified compatibility: the same authorized gateway powers Claude Code CLI, Claude Desktop, and IDE tools simultaneously.

### Honest Technical Acknowledgment & Disclaimer 💀
Limitless Claude routes requests through top frontier models (Claude 3.5 Sonnet endpoints, GPT-4o, Codestral, Qwen 2.5 Coder, GLM-5). It cannot physically replicate the proprietary Anthropic server-side parameter weights of official paid Opus 5.5 or Fable 5.1 models. However, by combining official Anthropic cognitive directives, Orchestra 5.5.0 system prompts, and sub-second priority fallback hierarchies, it delivers the closest free equivalent available, offering comparable reasoning, superior developer resilience, and zero token costs.

### What Was Updated in v8.5.0 🔥💀
1. Priority Strategy Architecture: Migrated all 6 combos from round-robin to strict priority routing (`strategy: "priority"`). Pinned fast primary models (`github/gpt-4o-2024-11-20`, `mistral/codestral-latest`, `github/gpt-4o-mini`, latency 0.8s - 1.8s) at priority index 0 to eliminate persona leakage, with `kiro/claude-sonnet-4.5` as fast failover. Purged slow or broken models (`kiro/deepseek-3.2` with 150s timeouts, `xkiro/mistralai/mistral-large-2512` with HTTP 403, and `gemma-4-31b-it` with 110s timeouts) to permanently eliminate multi-turn conversation freezes.
2. Claude Desktop Skills & Orchestra Sync: Enabled `skillScanningEnabled: true` in Claude Desktop user config (`configLibrary/<UUID>.json`). Synced 119 Orchestra Workflow skills into the Desktop skills directory and indexed every skill in `manifest.json`. Registered `claude-desktop` as a canonical sync host in `host-dirs.json`. Configured both `orchestra-workflow` and `orchestra-brain` filesystem MCP servers in `claude_desktop_config.json`.
3. System Prompts & Identity Guardrails: Injected official Anthropic Claude cognitive directives, artifacts rules, and Orchestra 5.5.0 control plane instructions into Claude Desktop `organizationInstructions` and embedded `system_message` inside the combo `data` JSON blob for OmniRoute database compatibility, eliminating persona leakage ("I'm Kiro").
4. Clean UTF-8 Environment: Repaired UTF-16LE null-byte corruption in `~/.omniroute/.env`.

---

Follow this strict, verified installation procedure:

### PHASE 1: INSPECTION & ENVIRONMENT BASELINE (DO NOT CHANGE ANYTHING YET)
1. Detect Operating System and Architecture (Windows, macOS, or Linux).
2. Detect Node.js version (`node -v`). Node.js >= 22 is strictly required. If Node.js < 22, report BLOCKED and instruct the user to update Node.js.
3. Detect package managers (`pnpm`, `npm`, `bun`). Prefer pnpm if available.
4. Detect Claude Code CLI installation (`claude --version`).
5. Detect supported IDEs (VS Code, Cursor, Antigravity) and inspect installed extensions.
6. Detect Claude Desktop installation and inspect `%APPDATA%\Claude\claude_desktop_config.json` and `%LOCALAPPDATA%\Claude-3p\configLibrary\*.json`.
7. Detect OmniRouter installation and database:
   - Check if OmniRoute is installed globally (`omniroute --version`).
   - Check if OmniRoute data directory exists (`~/.omniroute`).
   - Check if SQLite database exists (`~/.omniroute/storage.sqlite`).
8. Detect existing credentials and API keys in `storage.sqlite` and `~/.claude/settings.json`. Mask all keys in output (e.g. `sk-ant-...62127e`).
9. Generate a Pre-Installation Baseline Report classifying each component as:
   [INSTALLED / MISSING / OUTDATED / CONFLICTING]

### PHASE 2: BACKUP & PRESERVATION (MANDATORY SAFETY GATE)
1. NEVER delete existing provider accounts, credentials, or OmniRouter databases.
2. Back up `~/.omniroute/storage.sqlite` using a safe copy before making changes (`storage.sqlite.bak`).
3. Back up `~/.claude/settings.json` if it exists (`settings.json.bak-<timestamp>`).
4. Back up IDE settings (`settings.json.bak-<timestamp>`).

### PHASE 3: INSTALLATION & CORE SETUP
1. Clone or navigate to the Limitless Claude repository:
   - If already present at `C:\projects\limitless-claude` (or `~/projects/limitless-claude`), use existing directory.
   - Otherwise, clone: `git clone https://github.com/mahik504/limitless-claude.git`
2. Install dependencies: `pnpm install` (or `npm install`).
3. Run automated test suite: `npm test`. Ensure all tests pass.
4. If OmniRoute is not installed, install globally: `pnpm add -g omniroute` (or `npm i -g omniroute`).
5. Ensure OmniRoute gateway daemon is running on port 20128:
   - On Windows: run `omniroute serve --daemon --no-open` or `omniroute-daemon.bat`.
   - On Unix: run `start-daemon.sh` or `omniroute serve --daemon`.
   - Verify HTTP reachability: probe `http://127.0.0.1:20128/health` or `/v1/models`.

### PHASE 4: COMBO CONFIGURATION & POLICY SYNC
1. Sync live OmniRoute models into Limitless Claude 6-tier priority routing combos:
   `node scripts/setup.js`
   - Configures `haiku`, `sonnet`, `opus`, `fable`, `desktop-chat`, and `desktop-cowork` with `strategy: "priority"`.
   - Enforces model-combo mappings in `model_combo_mappings`.
   - Authorizes the active API key in `api_keys` (`allowed_combos` / `model_access_mode: 'all'`).
2. Run live combo verification:
   `node scripts/verify-combos.js`
   - Must achieve 12/12 passed HTTP 200 responses across all aliases and direct combos.

### PHASE 5: CLAUDE DESKTOP & CLIENT INTEGRATION
1. Configure Claude Code CLI (`~/.claude/settings.json`):
   - Set `"env": { "ANTHROPIC_BASE_URL": "http://localhost:20128", "ANTHROPIC_AUTH_TOKEN": "<authorized-key>" }`.
2. Configure Claude Desktop Third-Party Gateway:
   - In `%LOCALAPPDATA%\Claude-3p\configLibrary\<UUID>.json`, ensure `"skillScanningEnabled": true`.
   - Embed official Anthropic cognitive directives and Orchestra 5.5.0 instructions into `"organizationInstructions"`.
   - Sync Orchestra skills into `%LOCALAPPDATA%\Claude-3p\local-agent-mode-sessions\skills-plugin\...\skills` and update `manifest.json`.
3. Configure VS Code & Cursor IDE settings:
   - Set `claudeCode.environmentVariables` and `"claudeCode.disableLoginPrompt": true`.
4. If Orchestra Workflow exists on disk (`C:\projects\orchestra-workflow`):
   - Run `node C:\projects\orchestra-workflow\runtime\tools\ow-sync.mjs --apply --host claude-desktop`.

### PHASE 6: FINAL HEALTH VERIFICATION & REPORT
1. Execute the 16-point diagnostic doctor:
   `node scripts/doctor.js`
   Must achieve 16/16 PASSED with 0 ERRORS.
2. Execute live combo verification:
   `node scripts/verify-combos.js`
   Must achieve 12/12 PASSED with sub-second response times.
3. Output the Final Installation Report including:
   - Node & Runtime Versions
   - OmniRoute Gateway Status & Port (:20128)
   - Verified Active Tiers & Candidate Counts (All 6 Tiers Active)
   - Verified Skills Count (119 Skills Synced)
   - Instructions to launch: `claude` CLI or Claude Desktop application
```
