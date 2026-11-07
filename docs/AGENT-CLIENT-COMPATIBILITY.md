# Limitless Claude 7.0.0 — Agent Client Compatibility Matrix

This document provides verified integration results for all supported developer client interfaces and autonomous agents.

---

## 1. Verified Client Compatibility Matrix

| Client Harness | Integration Protocol | Auth Header Style | Streaming | Tool Calling | Multi-Turn | File Editing | Shell Exec | Compatibility Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Claude Code CLI** (`@anthropic-ai/claude-code`) | Anthropic Messages | `x-api-key` / `Authorization` | Yes | Anthropic tool_use | Yes | Yes | Yes | `VERIFIED` |
| **Claude Code VS Code Ext** | Anthropic Messages | `x-api-key` | Yes | Anthropic tool_use | Yes | Yes | Yes | `VERIFIED` |
| **Superdesign / Open Design** (`@superdesign/cli`) | Anthropic Messages | `x-api-key` | Yes | Anthropic tool_use | Yes | Yes | Yes | `VERIFIED` |
| **OpenCode CLI** | OpenAI Chat | `Authorization: Bearer` | Yes | OpenAI tool_calls | Yes | Yes | Yes | `VERIFIED` |
| **Antigravity Integrated Terminal** | Anthropic Messages | `x-api-key` | Yes | Anthropic tool_use | Yes | Yes | Yes | `VERIFIED` |
| **Cursor Integrated Terminal** | Anthropic Messages | `x-api-key` / Env | Yes | Anthropic tool_use | Yes | Yes | Yes | `VERIFIED` |
| **Cursor Custom Model GUI** | OpenAI / Anthropic | Various | Partial | Limited | Varies | No | No | `EXPERIMENTAL` (Use Terminal) |

---

## 2. Detailed Client Test Verifications

### A. Claude Code CLI (`@anthropic-ai/claude-code`)
- **Execution:** `npm run launcher` or direct `claude` command.
- **Header Auth:** Accepts `ANTHROPIC_AUTH_TOKEN` or `ANTHROPIC_API_KEY`.
- **System Prompts:** Top-level `system` string accepted and preserved.
- **Tool Calling:** Emits native Anthropic `tool_use` events. OmniRoute normalizes to upstream provider schemas and converts upstream responses back to Anthropic format.
- **Streaming:** SSE chunk stream handled smoothly without buffering delay.

### B. Superdesign / Open Design CLI (`@superdesign/cli`)
- **Execution:** `npx @superdesign/cli generate "Landing page hero"`
- **Routing:** Reads `ANTHROPIC_BASE_URL` from environment or `~/.claude/settings.json`.
- **Behavior:** Dispatches design generation requests to `claude-sonnet-5` (Sonnet tier) and `claude-opus-4-8` (Opus tier), returning complete React/Tailwind code artifacts.

### C. OpenCode CLI
- **Execution:** `opencode --base-url http://127.0.0.1:20128/v1`
- **Protocol:** Standard OpenAI `/v1/chat/completions`.
- **System Prompts:** System instructions placed in the first message (`role: "system"`).
- **Tool Calling:** OpenAI `tool_calls` array with function arguments.

### D. Cursor IDE Terminal
- **Execution:** Open Cursor integrated terminal (`Ctrl + \``), run `npm run launcher`.
- **Isolation:** Operates cleanly in the active repository without mutating global system configurations.
- **Note:** Cursor's graphical "Custom Model" input has proprietary endpoint restrictions; the integrated terminal running Claude Code is the officially verified pathway.
