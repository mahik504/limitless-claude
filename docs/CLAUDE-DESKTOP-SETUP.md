# Claude Desktop Step-by-Step Setup Guide
**Audience**: Developers configuring Claude Desktop with OmniRoute MCP Tools & Desktop Combos  
**Target File**: `%APPDATA%\Claude\claude_desktop_config.json`  

---

## Prerequisites
1. Anthropic Claude Desktop installed on Windows (`claude.exe`).
2. Node.js `>= 22` and `npx` available on system PATH.
3. OmniRoute running locally on `http://127.0.0.1:20128`.

---

## Step 1: Back Up Existing Configuration
Before making any changes, back up your current desktop configuration:
```powershell
$configDir = "$env:APPDATA\Claude"
if (Test-Path "$configDir\claude_desktop_config.json") {
    Copy-Item "$configDir\claude_desktop_config.json" "$configDir\claude_desktop_config.json.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "Backed up existing claude_desktop_config.json"
}
```

---

## Step 2: Configure MCP Servers in `claude_desktop_config.json`
Write or merge the following configuration into `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "orchestra-brain": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\projects\\orchestra-brain"
      ]
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp"
      ]
    },
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ]
    },
    "stitch": {
      "command": "npx",
      "args": [
        "-y",
        "@_davideast/stitch-mcp",
        "proxy"
      ],
      "env": {
        "STITCH_API_KEY": "your-stitch-api-key"
      }
    },
    "shadcn": {
      "command": "npx",
      "args": [
        "-y",
        "@shadcn/mcp-server"
      ]
    },
    "magic-ui": {
      "command": "npx",
      "args": [
        "-y",
        "@magicuidesign/mcp@latest"
      ]
    }
  }
}
```

---

## Step 3: Verify Desktop Combos in OmniRoute
Confirm that the desktop combos are registered in OmniRoute:
```bash
limitless status
```
Verify that the following tiers are active:
- `Claude Desktop Chat` -> `kiro/claude-sonnet-4.5` (7 models)
- `Claude Desktop Cowork` -> `kiro/claude-sonnet-4.5` (7 models)

---

## Step 4: Restart Claude Desktop
1. Completely exit Claude Desktop from the system tray (right-click Claude icon -> Quit).
2. Launch Claude Desktop from Start Menu or shortcut.
3. Click the hammer / tools icon in the prompt composer to verify connected MCP servers (`orchestra-brain`, `playwright`, `context7`, etc.).

---

## Rollback Procedure
If you need to revert to your previous configuration:
```powershell
$backup = Get-ChildItem "$env:APPDATA\Claude\claude_desktop_config.json.bak-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($backup) {
    Copy-Item $backup.FullName "$env:APPDATA\Claude\claude_desktop_config.json" -Force
    Write-Host "Restored configuration from $($backup.Name)"
}
```
