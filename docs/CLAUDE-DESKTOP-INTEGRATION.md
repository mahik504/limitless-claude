# Limitless Claude — Claude Desktop Integration & Architectural Realities
**Target Client**: Anthropic Claude Desktop for Windows (`claude.exe`)  
**Installed Binary**: `C:\Program Files\WindowsApps\Claude_5.1231.2.0_x64__pzs8sxrjxfjjc\app\claude.exe` [VERIFIED]  
**Config Path**: `%APPDATA%\Claude\claude_desktop_config.json` [VERIFIED]  
**Document Revision**: November 2026  

---

## 1. Architectural Realities: Native Capabilities vs. Hard Limitations

A paramount requirement of this mandate is absolute technical accuracy: **Never confuse Claude Desktop's Model-Context Protocol (MCP) configuration with its model-provider inference endpoint.**

### The Native Claude Desktop Hard Constraint [VERIFIED]
1. **Proprietary Hardwiring**: The official Anthropic Claude Desktop client for Windows/macOS is an Electron application hardwired to communicate exclusively with Anthropic's proprietary cloud infrastructure (`api.anthropic.com`) using session cookies and web OAuth authentication.
2. **Schema Limitation of `claude_desktop_config.json`**: The official desktop configuration file strictly validates only top-level `mcpServers`. Any attempt to insert `"env": { "ANTHROPIC_BASE_URL": "..." }` or `"baseURL": "..."` into `claude_desktop_config.json` is ignored by the native Electron binary.
3. **No Native Base-URL Override**: Unlike the Claude Code CLI (which officially documents and supports `ANTHROPIC_BASE_URL`), native Claude Desktop exposes no official setting to redirect chat completions to custom endpoints.

---

## 2. Supported Integration Paths

Because native Claude Desktop cannot redirect its primary chat completion loop to a local proxy without unsupported binary patching or MITM proxy certificates, Limitless Claude supports three robust, production-approved integration paths:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CLAUDE DESKTOP INTEGRATION TOPOLOGY                             │
├────────────────────────────┬───────────────────────────────────────────────────────────┤
│ Path 1: MCP Server Bridge  │ Desktop connects to native Anthropic, but uses MCP tools  │
│         (Fully Supported)  │ (orchestra-brain, stitch, playwright, context7) to act on │
│                            │ local files and systems.                                  │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│ Path 2: Dedicated Desktop  │ OmniRoute maintains pre-configured combos (`desktop-chat`  │
│         Combos in Gateway  │ and `desktop-cowork`) ready for desktop-style clients     │
│                            │ requesting desktop aliases.                               │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│ Path 3: Anthropic-Compat   │ Open-source desktop clients (Chatbox, Cherry Studio,      │
│         Desktop Clients    │ LibreChat) pointed directly at OmniRoute (:20128) with    │
│                            │ full multi-provider routing and custom model aliases.     │
└────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 3. Path 1: Production MCP Configuration (`claude_desktop_config.json`)

To provide Claude Desktop with complete access to local development capabilities, configure `%APPDATA%\Claude\claude_desktop_config.json`:

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

## 4. Path 2: Dedicated Desktop Combos in OmniRoute

For applications and local agents requesting desktop workloads, Limitless Claude configures two dedicated tiers in OmniRoute:

### A. Claude Desktop Chat (`combo/desktop-chat`)
- **Route Mapping**: Matches `*desktop-chat*` (Priority 15).
- **Waterfall**:
  1. `kiro/claude-sonnet-4.5`
  2. `github/gpt-4o-2024-11-20`
  3. `xkiro/mistralai/mistral-large-2512`
  4. `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free`
  5. `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`

### B. Claude Desktop Cowork (`combo/desktop-cowork`)
- **Route Mapping**: Matches `*desktop-cowork*` (Priority 15).
- **Waterfall**:
  1. `kiro/claude-sonnet-4.5`
  2. `github/gpt-4o-2024-11-20`
  3. `xkiro/mistralai/mistral-large-2512`
  4. `kiro/glm-5`
  5. `kiro/deepseek-3.2`

---

## 5. Path 3: Open-Source Desktop Clients for OmniRoute

For developers who require a dedicated desktop GUI app connected to OmniRoute:
- **Recommended Clients**: **Cherry Studio** or **Chatbox**.
- **Setup**:
  1. Open Client Settings -> Select **Anthropic API** (or Custom Provider).
  2. Set **API Host / Base URL**: `http://127.0.0.1:20128`.
  3. Set **API Key**: `sk-ant-api03...your-limitless-token`.
  4. Set **Model**: `claude-sonnet-5` (routes to Sonnet tier) or `claude-opus-5-5` (routes to Opus tier).
  5. **Verification**: Send a prompt; verify HTTP 200 SSE streaming in real time.
