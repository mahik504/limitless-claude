# Limitless Claude

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Limitless Claude** completely overrides standard Claude Code pricing by routing it through local OmniRoute, transforming your local coding setup into a massive, multi-provider AI network capable of millions of free tokens per day.

This installer perfectly maps Claude Code's three default tiers (Opus, Sonnet, Haiku) into hyper-optimized model combos, prioritizing the absolute best free coding agents available while actively protecting your shared token pools.

## Core Strategy

Providers like OpenRouter pool all your free models into a single daily request limit (e.g., 50 requests/day for standard users, or 1000 requests/day for verified users). To maximize development power, we heavily restrict the models in the Sonnet and Haiku tiers to preserve tokens, focusing almost all token bandwidth on the **Opus tier** for heavy coding tasks.

### 1. Opus Tier (Coding & Development)
* **Goal:** The absolute best coding models for agentic AI development, web design, hard coding, debugging, and testing. Ranked by quality and token availability.
* **Models (16):** Copilot (Claude 3.5 Sonnet, GPT-4o, o1-mini), DeepSeek Coder, Mistral Codestral, SambaNova Llama 3.1 405B, GLM-First (Kiro, OpenRouter, Cloudflare), Qwen 32B Coder, Gemini 3.8 Flash Tiered, Nemotron Super 120B, etc.
* **Estimated Limits:** **~5 Million to 8 Million tokens per day** (drawing heavily from Cloudflare Neurons, GitHub Copilot, DeepSeek, SambaNova, Kiro credits, and OpenRouter requests).

### 2. Sonnet Tier (System Design & Brainstorming)
* **Goal:** Planning, architecture, PRDs, and deep thinking.
* **Models (4):** Only the elite reasoning engines: Claude Opus 4.6 Thinking (Antigravity), Claude Sonnet 4.6, GitHub o1-preview, and Nemotron Ultra 550B.
* **Estimated Limits:** **~3 Million to 4 Million tokens per day**.

### 3. Haiku Tier (Rapid Responses)
* **Goal:** Short answers and rapid lookups.
* **Models (3):** Only the fastest inferencing engines in existence: Cerebras Llama 3.1 70B, GPT-OSS (Groq), and Nemotron 3.5 Lightning (OpenRouter).
* **Estimated Limits:** **~5 Million to 7 Million tokens per day**.

**Total Arsenal Capacity:** You are effectively equipped with a system capable of pushing **~13 Million to 19 Million free tokens every single day**. If a model hits a rate limit, OmniRoute will instantaneously cascade down the list without Claude Code ever throwing an error on your screen.

### 💡 Pro-Tip: The $10 OpenRouter Hack (Unlock 40M+ Tokens/Day)
If you top up your OpenRouter account with just **$10**, it instantly converts your account from the standard free tier (50 requests/day) to the verified tier (**1,000 requests/day**). 
* **The Trick:** You *don't* actually have to spend the $10! As long as the balance sits in your account, your daily free-model request limit increases by 20x.
* **The Result:** Because this architecture aggressively utilizes OpenRouter's free models, this simple hack skyrockets your daily free token limit from ~15 Million up to **40 Million - 50 Million free tokens per day** for coding, completely for free.

## Architecture

```mermaid
flowchart LR
  claudeCode[ClaudeCode]
  opus[Opus - 16 Models]
  sonnet[Sonnet - 4 Models]
  haiku[Haiku - 3 Models]
  claudeCode -->|"claude-opus"| opus
  claudeCode -->|"claude-sonnet"| sonnet
  claudeCode -->|"claude-haiku"| haiku
```

## Requirements

- Node.js 22 or newer (`node:sqlite` is built in; no npm packages are required)
- [OmniRoute](https://github.com/diegosouzapw/OmniRoute) 3.8.x, installed and started at least once
- [Claude Code](https://code.claude.com/docs/en/overview) CLI (and the VS Code extension)
- Provider credentials that **you** connect manually in the OmniRoute dashboard

## Installation

There are **no npm dependencies**. Do not run `npm install`, and do not install `better-sqlite3`. Setup uses Node's built-in `node:sqlite`.

1. Start OmniRoute globally:
```bash
npm install -g omniroute
omniroute serve
```
2. Open `http://localhost:20128`, connect **OpenRouter**, **Groq**, **Cloudflare**, and **Kiro**.
3. Create an OmniRoute API key from the dashboard.
4. Clone and setup this repository:
```bash
git clone https://github.com/mahik504/limitless-claude.git
cd limitless-claude
node setup.js
node validate.js
```

## Claude Code setup

Setup automatically edits your `~/.claude/settings.json` file. A timestamped backup is written first.

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:20128",
    "ANTHROPIC_AUTH_TOKEN": "sk-ant-api03-limitless-claude-key",
    "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY": "1",
    "ANTHROPIC_MODEL": "limitless-opus"
  }
}
```

### VS Code integration

Setup automatically injects `claudeCode.environmentVariables` into your VS Code user settings to immediately route the Claude Code VS Code extension through your new massive AI fleet.

## Verification & Troubleshooting

Run `node validate.js` at any time to verify the database schema, models, active providers, and JSON settings.

**Windows Auto-Boot:**
The setup script will automatically detect if you are on Windows and configure OmniRoute to silently launch in the background every time you boot your PC. You never have to manually start it.
To completely remove the startup launcher:
```bash
node setup.js --uninstall-startup
```

## License

MIT. Copyright (c) 2026 mahik504.
