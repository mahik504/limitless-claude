# Limitless Claude 7.0 - Multi-Client Compatibility Guide

Limitless Claude 7.0 supports multiple developer interfaces and autonomous agent harnesses. This guide provides exact setup instructions and architectural integration details for each supported client.

---

## 1. Claude Code CLI (@anthropic-ai/claude-code)

### Setup
Install Claude Code globally:
```bash
npm install -g @anthropic-ai/claude-code
```

### Execution Options
1. **Scoped Launcher (Recommended):**
   ```bash
   npm run launcher
   # or with specific arguments:
   npm run launcher -- --print "Analyze repository structure"
   ```
2. **Direct CLI via ~/.claude/settings.json:**
   Once `node scripts/setup.js` has run, `~/.claude/settings.json` is configured with:
   ```json
   {
     "env": {
       "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128",
       "ANTHROPIC_AUTH_TOKEN": "YOUR_OMNIROUTE_API_KEY"
     },
     "primaryModel": "claude-opus-5-5"
   }
   ```
   Simply type `claude` in any terminal.

---

## 2. Claude Code VS Code & Cursor Extensions

The official Claude Code extension runs worker processes under the hood. It reads settings from `~/.claude/settings.json` and inherits environment variables.

### Configuration
1. Ensure `~/.claude/settings.json` has `ANTHROPIC_BASE_URL` pointing to `http://127.0.0.1:20128`.
2. In VS Code or Cursor settings (`settings.json`), you can also explicitly specify:
   ```json
   "claudeCode.environmentVariables": {
     "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128"
   }
   ```
3. The extension routes all model completions through OmniRoute combos automatically.

---

## 3. Superdesign / Open Design CLI (@superdesign/cli)

Superdesign (formerly Open Design) enables autonomous UI and component generation from prompts and design systems.

### Integration Path
Superdesign uses the Claude Messages API protocol. When running Superdesign commands:
```bash
npx @superdesign/cli generate "Landing page hero section with glassmorphism and Tailwind v4"
```
It reads `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` from the shell environment or `~/.claude/settings.json`, routing design generation tasks directly through Limitless Sonnet 5.5 and Opus 5.5 combos.

---

## 4. OpenCode CLI & Extension

OpenCode uses standard OpenAI-compatible endpoints.

### Configuration
Point OpenCode to OmniRoute's OpenAI compatibility endpoint:
- **Base URL:** `http://127.0.0.1:20128/v1`
- **API Key:** Your OmniRoute API key
- **Model:** `limitless-sonnet-5.5` or `limitless-opus-5.5`

When running OpenCode CLI:
```bash
opencode --base-url http://127.0.0.1:20128/v1 --model limitless-opus-5.5
```

---

## 5. Antigravity IDE & CLI

Antigravity IDE natively integrates with Google One AI and Claude models. When using Limitless Claude:
1. Ensure OmniRoute is running on port 20128.
2. In Antigravity settings or `.env`, set:
   ```env
   ANTHROPIC_BASE_URL=http://127.0.0.1:20128
   ```
3. Limitless Claude's active fallback engine will automatically guard Antigravity from Google Cloud Code PA deprecation notices, routing to healthy alternative providers without interrupting your coding flow.

---

## 6. Cursor IDE

Cursor operates best with Limitless Claude through its integrated terminal:
1. Open Cursor integrated terminal (`Ctrl + \`` or `Cmd + \``).
2. Run `claude` or `npm run launcher`.
3. Claude Code executes seamlessly within the Cursor workspace, reading and editing local project files.
