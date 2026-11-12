# Limitless Claude — IDE Integration Guide (VS Code, Cursor & Antigravity)
**Target IDEs**: Visual Studio Code, Cursor IDE, Antigravity IDE  
**Primary Extension**: `anthropic.claude-code` (v2.1.322) [VERIFIED INSTALLED]  
**Document Revision**: November 2026  

---

## 1. Overview & Non-Destructive Configuration Policy

A critical preservation mandate: **Never overwrite a developer's existing IDE settings file with a naive overwrite.** Developers maintain custom themes, keybindings, language formatters, and linting rules. Limitless Claude provides targeted, non-destructive configuration snippets that merge cleanly into existing configuration files.

---

## 2. Visual Studio Code Integration

### Extension Baseline
- **Extension ID**: `anthropic.claude-code` (v2.1.322) [VERIFIED INSTALLED]
- **Configuration File**: `%APPDATA%\Code\User\settings.json`

### Supported Extension Properties (from `package.json` inspection)
1. `claudeCode.environmentVariables`: Array of `{ name, value }` objects passed to the Claude process.
2. `claudeCode.disableLoginPrompt`: When set to `true`, disables external OAuth web prompts when external token authentication is configured.
3. `claudeCode.claudeProcessWrapper`: Allows specifying a custom wrapper binary or launcher script.
4. `claudeCode.initialPermissionMode`: Sets initial turn permissions (`acceptEdits`, `default`, `bypassPermissions`).
5. `claudeCode.useTerminal`: When `true`, spawns Claude Code in the integrated terminal rather than the webview panel.

### Recommended VS Code `settings.json` Merge Block
Merge these settings into your `%APPDATA%\Code\User\settings.json`:
```jsonc
{
  // --- Limitless Claude & OmniRoute Integration ---
  "claudeCode.environmentVariables": [
    {
      "name": "ANTHROPIC_BASE_URL",
      "value": "http://127.0.0.1:20128"
    },
    {
      "name": "ANTHROPIC_AUTH_TOKEN",
      "value": "sk-ant-api03...your-limitless-token"
    }
  ],
  "claudeCode.disableLoginPrompt": true,
  "claudeCode.initialPermissionMode": "acceptEdits",
  "claudeCode.autosave": true
}
```

*Note*: Because the Claude Code extension also reads `~/.claude/settings.json`, configuring `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` in `~/.claude/settings.json` provides universal routing across both CLI and VS Code without requiring IDE settings modifications.

---

## 3. Cursor IDE Integration

### Extension Baseline
- **Installed Cursor Version**: `2026.11.05-86047df` [VERIFIED]
- **Extension Location**: `%USERPROFILE%\.cursor\extensions\anthropic.claude-code-2.1.322-win32-x64` [VERIFIED INSTALLED]
- **Settings Path**: `%APPDATA%\Cursor\User\settings.json`

### Integration Methods
1. **Method A: Integrated Claude Code Extension**
   - Cursor shares the VS Code extension architecture.
   - Insert the identical `claudeCode.environmentVariables` and `claudeCode.disableLoginPrompt` block into `%APPDATA%\Cursor\User\settings.json`.
   - Launch Claude Code from the Cursor Command Palette (`Ctrl+Shift+P` -> `Claude Code: Open`).

2. **Method B: Integrated Terminal Pair-Programming (Recommended)**
   - Open Cursor's integrated terminal (`Ctrl+\``).
   - Because `~/.claude/settings.json` is already configured with OmniRoute, typing `claude` in Cursor terminal connects immediately to OmniRoute with full TUI support and RTK token optimization.
   - Alternatively, execute `limitless launcher` to launch under a process-isolated profile.

3. **Method C: Cursor Custom OpenAI Endpoint (for Cursor Chat Panel)**
   - In Cursor Settings -> Models:
   - Override Base URL: `http://127.0.0.1:20128/v1`
   - API Key: `sk-ant-api03...your-limitless-token`
   - Model: `claude-sonnet-5` (routes to Limitless Sonnet 5.5 Tier)

---

## 4. Antigravity IDE Integration

### Environment Profile
- **Host IDE**: Google Antigravity IDE [ACTIVE ENVIRONMENT]
- **Capabilities**: Native Model-Context Protocol (MCP) server support, integrated terminal, skills engine, and rule governance.

### Configuration Steps
1. **Terminal Integration**:
   - The integrated PowerShell terminal in Antigravity automatically resolves the global `limitless` CLI and `claude` CLI.
   - Run `limitless status` to inspect active tiers.
   - Run `claude` to initiate interactive coding sessions routed through OmniRoute.
2. **MCP Tool Integration**:
   - Antigravity natively loads MCP servers configured in `settings.json` or project rules (`orchestra-brain`, `stitch`, `playwright`, `context7`).
   - Claude Code sessions launched in Antigravity inherit these MCP tools via `~/.claude/settings.json`.

---

## 5. Non-Destructive Merge & Verification Protocol

### Verification Command
Run the diagnostic doctor to confirm all IDE prerequisites and gateway reachability:
```bash
limitless doctor
```
Verify that:
- `Local Gateway Reachability (:20128)` is **PASS (HTTP 200 OK)**.
- `OmniRoute API Key Authorization` is **PASS**.
- `Claude Code Configuration Dir` is **PASS**.

### Safe Rollback
To remove IDE integration without disrupting unrelated settings, delete only the `claudeCode.*` keys from your IDE's `settings.json`.
