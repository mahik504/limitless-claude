# Limitless Claude 8.5.0 — Master Installation Prompt for AI Coding Agents
**Target Agents**: Cursor (Claude 3.5 Sonnet / Grok), Claude Code, Antigravity, Codex CLI  
**Purpose**: Complete, safe, verified installation and configuration of Limitless Claude on any workstation  

---

```markdown
You are an expert AI systems administrator and autonomous engineering agent assigned to install and configure Limitless Claude (https://github.com/mahik504/limitless-claude) on this machine.

### What is Limitless Claude?
Limitless Claude is an independent, production-grade developer control plane and multi-provider routing ecosystem built around the modern Claude experience. Operating above a local OmniRoute gateway (`http://127.0.0.1:20128`), it liberates developers from vendor lock-in, arbitrary rate limits, and runaway token costs—connecting Claude Code CLI, Claude Desktop (Chat & Cowork), VS Code, Cursor, and Antigravity to over 580 models across 16+ global providers with sub-second failover.

### What We Are Providing For Free
We provide the entire Claude developer ecosystem completely free using local OmniRouter combos:
- Claude Code CLI (terminal agentic coding)
- Claude Desktop Third-Party Application (Desktop Chat & Desktop Cowork)
- Claude Code Desktop & VS Code / Cursor IDE extensions
- 6 Production Routing Tiers: Limitless Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.2, Desktop Chat, and Desktop Cowork
- Authentic Anthropic Model Directives embedded in every combo, preventing persona leakage and enforcing production code quality

### How Limitless Claude Surpasses Raw Claude Code / Codex CLI
- Raw Claude Code and Codex CLI lock you into a single proprietary provider with rigid request quotas, expensive metered billing ($15 to $75 per million tokens), and fatal session crashes whenever an HTTP 429 rate limit or server outage occurs.
- Limitless Claude eliminates single-point-of-failure crashes with sub-second priority failover across global providers. If any endpoint is throttled or offline, requests instantly cascade to healthy models without losing conversation state.
- Model-appropriate cognitive directives (from Anthropic's flagship leaks) ensure each tier performs its specific role with high epistemic honesty, decisive guidance, and zero-stub invariants.
- Multi-client unified compatibility: the same authorized gateway powers Claude Code CLI, Claude Desktop, and IDE tools simultaneously.

### Technical Acknowledgment & Disclaimer
Limitless Claude routes requests through top frontier models (Claude 3.5 Sonnet endpoints, GPT-4o, Codestral, Qwen 2.5 Coder, GLM-5). It does not claim proprietary Anthropic server-side weights; however, by combining official Anthropic cognitive directives and sub-second priority fallback hierarchies, it provides a highly capable, resilient, and cost-effective coding agent runtime.

### What Was Updated in v8.5.0
1. Priority Strategy Architecture: Migrated all 6 combos from round-robin to strict priority routing (`strategy: "priority"`). Pinned fast primary models (`github/gpt-4o-2024-11-20`, `mistral/codestral-latest`, `github/gpt-4o-mini`, latency 0.8s - 1.8s) at priority index 0 to eliminate persona leakage, with `kiro/claude-sonnet-4.5` as fast failover. Purged slow or broken models (`kiro/deepseek-3.2` with 150s timeouts, `xkiro/mistralai/mistral-large-2512` with HTTP 403, and `gemma-4-31b-it` with 110s timeouts) to permanently eliminate multi-turn conversation freezes.
2. Official Model-Appropriate Prompts: Embedded authentic Anthropic cognitive instructions tailored specifically to Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.2, Desktop Chat, and Cowork inside both combo system messages and `data` JSON blobs.
3. Streamlined Routing: Permanently purged unmaintained legacy routes (`claude-tutor` and `claude-convoz`).
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
2. Install dependencies: `npm install`.
3. Run automated test suite: `npm test`. Ensure all tests pass.
4. If OmniRoute is not installed, install globally: `npm i -g omniroute`.
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
2. Sync authentic Anthropic system prompts:
   `node scripts/update-prompts.js`
3. Run live combo verification:
   `node bin/limitless.js verify`
   - Must achieve 12/12 passed HTTP 200 responses across all aliases and direct combos.

### PHASE 5: CLAUDE DESKTOP & CLIENT INTEGRATION
1. Configure Claude Code CLI (`~/.claude/settings.json`):
   - Set `"env": { "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128", "ANTHROPIC_AUTH_TOKEN": "<authorized-key>" }`.
2. Configure Claude Desktop Third-Party Gateway:
   - In `%LOCALAPPDATA%\Claude-3p\configLibrary\<UUID>.json`, ensure `"modelDiscoveryEnabled": false`.
   - Ensure the 6 validated tiers are listed in `inferenceModels`.
3. Configure VS Code & Cursor IDE settings:
   - Set `claudeCode.environmentVariables` and `"claudeCode.disableLoginPrompt": true`.
4. (Optional) If an external conductor harness like Orchestra Workflow is present (`C:\projects\orchestra-workflow`), sync skills to Claude Desktop:
   - `node C:\projects\orchestra-workflow\runtime\tools\ow-sync.mjs --apply --host claude-desktop`

### PHASE 6: FINAL HEALTH VERIFICATION & REPORT
1. Execute the 16-point diagnostic doctor:
   `node bin/limitless.js doctor`
   Must achieve 16/16 PASSED with 0 ERRORS.
2. Execute live combo verification:
   `node bin/limitless.js verify`
   Must achieve 12/12 PASSED with sub-2s response times.
3. Output the Final Installation Report including:
   - Node & Runtime Versions
   - OmniRoute Gateway Status & Port (:20128)
   - Verified Active Tiers & Candidate Counts (All 6 Tiers Active)
   - Instructions to launch: `claude` CLI or Claude Desktop application
```

---

### Key Installation Tips

⚫️ **OpenRouter $10 Multiplier**: Depositing a one-time $10 balance unlocks 1,000 requests/day on `:free` models without reducing your deposited credit balance.  
⭐️ **Multi-Account Quota Stacking**: Add multiple free accounts per provider in OmniRoute for automatic load-balancing and 120s cooldown handling.  
🔹 **Windows Auto-Start**: Add `omniroute-daemon.bat` to `shell:startup` for automatic launch on boot.
