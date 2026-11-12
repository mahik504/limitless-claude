# Limitless Claude — Master Installation Prompt for AI Coding Agents
**Target Agents**: Cursor (Grok Extra High / Claude 3.5 Sonnet), Claude Code, Antigravity, Codex CLI  
**Purpose**: Complete, safe, verified installation and configuration of Limitless Claude on any workstation  

---

```markdown
You are an expert AI systems administrator and coding engineer assigned to install and configure Limitless Claude (https://github.com/mahik504/limitless-claude) on this machine.

Limitless Claude is an intelligent developer control plane and policy companion that pairs with OmniRouter to provide multi-provider model routing, 6-tier model combos, 20-workload prompt profiles, and granular file undo while preserving native Claude Code CLI and IDE workflows.

Follow this strict, verified installation procedure:

### PHASE 1: INSPECTION & ENVIRONMENT BASELINE (DO NOT CHANGE ANYTHING YET)
1. Detect Operating System and Architecture (Windows, macOS, or Linux).
2. Detect Node.js version (`node -v`). Node.js >= 22 is strictly required. If Node.js < 22, report BLOCKED and instruct the user to update Node.js.
3. Detect package managers (`pnpm`, `npm`, `bun`). Prefer pnpm if available.
4. Detect Claude Code CLI installation (`claude --version`).
5. Detect supported IDEs (VS Code, Cursor, Antigravity) and inspect installed extensions.
6. Detect Claude Desktop installation and inspect `%APPDATA%\Claude\claude_desktop_config.json` (or macOS equivalent).
7. Detect OmniRouter installation and database:
   - Check if OmniRoute is installed globally (`omniroute --version`).
   - Check if OmniRoute data directory exists (`~/.omniroute`).
   - Check if SQLite database exists (`~/.omniroute/storage.sqlite`).
8. Detect existing credentials and API keys in `storage.sqlite` and `~/.claude/settings.json`. NEVER print or leak full keys; mask them (e.g. `sk-ant-...62127e`).
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
1. Sync live OmniRoute models into Limitless Claude 6-tier routing combos:
   `node scripts/setup.js`
   - Configures `haiku`, `sonnet`, `opus`, `fable`, `desktop-chat`, and `desktop-cowork`.
   - Enforces model-combo mappings in `model_combo_mappings`.
   - Authorizes the active API key in `api_keys` (`allowed_combos` / `model_access_mode: 'all'`).
2. Run live combo verification:
   `node scripts/verify-combos.js`
   - Must achieve 8/8 HTTP 200 PONG responses across all tiers.

### PHASE 5: CLIENT INTEGRATION
1. Configure Claude Code CLI (`~/.claude/settings.json`):
   - Set `"env": { "ANTHROPIC_BASE_URL": "http://localhost:20128", "ANTHROPIC_AUTH_TOKEN": "<authorized-key>" }`.
   - Preserve existing hooks (`rtk hook claude`) and plugins.
2. Configure VS Code & Cursor IDE settings:
   - Merge `claudeCode.environmentVariables` and `"claudeCode.disableLoginPrompt": true`.
   - Do NOT overwrite unrelated editor settings.
3. If Claude Desktop is installed:
   - Merge MCP server configurations into `claude_desktop_config.json`.
4. If Orchestra Workflow exists on disk (`C:\projects\orchestra-workflow`):
   - Run `node scripts/orchestra.js sync` to synchronize contract skills.

### PHASE 6: FINAL HEALTH VERIFICATION & REPORT
1. Execute the 16-point diagnostic doctor:
   `node bin/limitless.js doctor`
   Must achieve 16/16 PASSED with 0 ERRORS.
2. Execute status overview:
   `node bin/limitless.js status`
3. Output the Final Installation Report including:
   - Node & Runtime Versions
   - OmniRoute Gateway Status & Port
   - Verified Active Tiers & Candidate Counts
   - Configured Clients (Claude Code, VS Code, Cursor, Desktop)
   - Instructions to launch: `claude` or `limitless launcher`
   - Rollback instructions
```
