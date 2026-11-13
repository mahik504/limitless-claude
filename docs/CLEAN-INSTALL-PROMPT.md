# Limitless Claude 8.5 — Clean Installation Prompt for Workstations 🔥💀
**Target**: Fresh Workstations & Isolated Environments  
**Safety Contract**: Explain actions before execution; never delete unrelated files  

---

```markdown
You are instructed to perform a Clean, Autonomous Installation of Limitless Claude on this machine.

### What is Limitless Claude? 🔥
Limitless Claude is an intelligent developer control plane and multi-provider routing ecosystem built around the modern Claude experience. Operating above a local OmniRoute gateway (http://127.0.0.1:20128), it connects Claude Code CLI, Claude Desktop (Chat & Cowork), VS Code, Cursor, and Antigravity to over 580 models across 14+ providers with sub-second failover.

### What We Provide For Free 🔥
The entire Claude developer ecosystem completely free via OmniRouter combos:
- Claude Code CLI (agentic coding assistant)
- Claude Desktop Third-Party Application (Desktop Chat & Desktop Cowork)
- Claude Code Desktop, VS Code, and Cursor IDE extensions
- 6 Production Routing Tiers (Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.1, Desktop Chat, Desktop Cowork)
- 119 Orchestra Workflow 5.5.0 Skills & MCP tooling suite

### How Limitless Claude Surpasses Raw Claude Code / Codex CLI 💀
- Raw Claude Code and Codex CLI lock you into a single proprietary provider with rigid request quotas, high token costs ($15-$75 per million tokens), and abrupt session terminations on rate limits or outages.
- Limitless Claude provides zero vendor lock-in with sub-second priority cascading failovers. If one provider hits a 429 rate limit or goes offline, the query automatically routes to the next healthy model without breaking multi-turn context.
- Includes 119 specialized Orchestra Workflow skills (fullstack architecture, 3D WebGL, strict TypeScript validation, automated testing, anti-slop design checks).
- Works with the same unified setup across CLI, desktop app, and IDEs.

### Honest Technical Acknowledgment & Disclaimer 💀
Limitless Claude routes through top frontier models (Claude 3.5 Sonnet endpoints, GPT-4o, Codestral, Qwen 2.5 Coder, GLM-5). It cannot physically replicate the proprietary Anthropic server-side parameter weights of official paid Opus 5.5 or Fable 5.1 models. However, by combining official Anthropic cognitive directives, Orchestra 5.5.0 system prompts, and sub-second priority fallback hierarchies, it provides the closest free equivalent available, delivering fast responses, high quality code, and robust developer velocity.

### What Was Updated in v8.5.0 🔥💀
1. Priority Routing Strategy: Configured all 6 tiers with `strategy: "priority"` and pinned fast models (`github/gpt-4o-2024-11-20`, `mistral/codestral-latest`, `github/gpt-4o-mini`, latency 0.8s - 1.8s) at index 0 to eliminate persona leakage, with `kiro/claude-sonnet-4.5` as fast failover. Purged slow models (`kiro/deepseek-3.2` with 150s timeouts, `xkiro/mistralai/mistral-large-2512` with HTTP 403, and `gemma-4-31b-it` with 110s timeouts) to permanently fix multi-turn conversation freezes.
2. Claude Desktop Skills & Orchestra Sync: Enabled `skillScanningEnabled: true` in `configLibrary/<UUID>.json`, copied 119 Orchestra skills to the Desktop skills directory, updated `manifest.json`, registered `claude-desktop` as a host in `host-dirs.json`, and configured `orchestra-workflow` and `orchestra-brain` filesystem MCP servers.
3. System Prompts & Identity Guardrails: Injected official Anthropic Claude cognitive directives, artifacts rules, and Orchestra 5.5.0 control plane instructions into Claude Desktop `organizationInstructions` and embedded `system_message` inside the combo `data` JSON blob for OmniRoute database compatibility, eliminating persona leakage ("I'm Kiro").
4. Clean UTF-8 Environment: Cleaned UTF-16LE null-byte corruption in `~/.omniroute/.env`.

---

### STEP 1: PRE-INSTALLATION DISCLOSURE & PRECHECK
Before modifying any files:
1. Verify operating system and verify Node.js >= 22 (`node -v`).
2. Explain to the user exactly what will be installed:
   - OmniRoute local gateway (Node.js AI proxy on port 20128).
   - Limitless Claude developer control plane (`bin/limitless.js`).
   - SQLite database initialization (`~/.omniroute/storage.sqlite`).
   - 6-tier model combos (Haiku, Sonnet, Opus, Fable, Desktop Chat, Desktop Cowork) with priority strategy.
   - Claude Code CLI configuration (`~/.claude/settings.json`).
   - Claude Desktop configuration (`configLibrary/*.json` and skills manifest).
3. Check for existing installations. If `~/.omniroute` or `~/.claude` already exists, create timestamped backups before proceeding.

### STEP 2: INSTALLATION
1. Clone repository to preferred development directory:
   `git clone https://github.com/mahik504/limitless-claude.git`
   `cd limitless-claude`
2. Install dependencies:
   `npm install`
3. Install OmniRoute globally:
   `npm install -g omniroute`
4. Start OmniRoute daemon:
   `omniroute serve --daemon --no-open`
   Verify port 20128 is listening.

### STEP 3: INITIALIZE & SYNC COMBOS
1. Sync model combos with priority strategy:
   `node scripts/setup.js`
2. Verify all 12 targets (6 route aliases + 6 direct combos):
   `node scripts/verify-combos.js`
   Ensure 12/12 passed with sub-second response times.

### STEP 4: CLIENT CONFIGURATION & DESKTOP SYNC
1. Configure `~/.claude/settings.json` with local endpoint and generated API key:
   `ANTHROPIC_BASE_URL: "http://localhost:20128"`
   `ANTHROPIC_AUTH_TOKEN: "<omniroute-api-key>"`
2. If Claude Desktop is installed:
   - Set `"skillScanningEnabled": true` in `%LOCALAPPDATA%\Claude-3p\configLibrary\<UUID>.json`.
   - Sync Orchestra skills to `%LOCALAPPDATA%\Claude-3p\local-agent-mode-sessions\skills-plugin\...\skills` and update `manifest.json`.
3. Verify with diagnostic doctor:
   `node scripts/doctor.js`
   Ensure 16/16 checks PASS.
```
