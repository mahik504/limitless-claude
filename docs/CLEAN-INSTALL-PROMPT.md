# Limitless Claude — Clean Installation Prompt
**Target**: Fresh Workstations & Isolated Environments  
**Safety Contract**: Explain actions before execution; never delete unrelated files  

---

```markdown
You are instructed to perform a Clean Installation of Limitless Claude on this machine.

### STEP 1: PRE-INSTALLATION DISCLOSURE & PRECHECK
Before modifying any files:
1. Verify operating system and verify Node.js >= 22 (`node -v`).
2. Explain to the user exactly what will be installed:
   - OmniRoute local gateway (Node.js AI proxy on port 20128).
   - Limitless Claude developer control plane (`bin/limitless.js`).
   - SQLite database initialization (`~/.omniroute/storage.sqlite`).
   - 6-tier model combos (Haiku, Sonnet, Opus, Fable, Desktop Chat, Desktop Cowork).
   - Claude Code CLI configuration (`~/.claude/settings.json`).
3. Check for existing installations. If `~/.omniroute` or `~/.claude` already exists, create timestamped backups before proceeding.

### STEP 2: INSTALLATION
1. Clone repository to preferred development directory:
   `git clone https://github.com/mahik504/limitless-claude.git`
   `cd limitless-claude`
2. Install dependencies:
   `pnpm install` (or `npm install`)
3. Install OmniRoute globally:
   `pnpm add -g omniroute` (or `npm install -g omniroute`)
4. Link Limitless CLI globally:
   `npm link`
5. Start OmniRoute daemon:
   `omniroute serve --daemon --no-open`
   Verify port 20128 is listening.

### STEP 3: INITIALIZE & SYNC COMBOS
1. Run initialization wizard:
   `limitless init`
2. Sync model combos:
   `limitless setup`
3. Verify all 8 endpoints:
   `limitless verify`

### STEP 4: CLIENT CONFIGURATION
1. Configure `~/.claude/settings.json` with local endpoint and generated API key:
   `ANTHROPIC_BASE_URL: "http://localhost:20128"`
   `ANTHROPIC_AUTH_TOKEN: "<omniroute-api-key>"`
2. Verify with diagnostic doctor:
   `limitless doctor`
   Ensure 16/16 checks PASS.
```
