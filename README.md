# Limitless Claude Architecture

A configuration architecture that transforms Claude Code into a completely free, autonomous AI software engineer. 

By default, Claude Code requires a paid Anthropic API key, which can become prohibitively expensive during large autonomous coding sessions. This repository provides a master configuration that hooks your local Claude Code environment (both terminal and VS Code extension) into a load-balanced, free-tier fleet of the world's most powerful open-weights and frontier models via OmniRoute.

## The Three Custom AI Fleets

This architecture automatically routes your Claude Code requests into three distinct tiers based on your needs:

### 1. OPUS TIER: The Elite Coding Fleet (~100M+ Tokens / Day)
When you ask Claude Code for `opus`, it routes to a heavy-duty algorithmic coding fleet. 
* **The Priority:** Chinese frontier GLM models (GLM-5, GLM-5.3-Flash, GLM-5.2) are prioritized for complex logic. 
* **The Backup:** If GLM is rate-limited, it automatically cascades to DeepSeek V3.2, Qwen3-Coder-Next, and Claude Sonnet 5.

### 2. SONNET TIER: Architecture & Reasoning (~50M+ Tokens / Day)
When you select `sonnet`, you get pure reasoning and high-level project planning. 
* **Top Models:** NVIDIA Nemotron-3 Super (120B), NVIDIA Nemotron-3 Ultra (550B), and DeepSeek V3.2.
* **Note:** We explicitly strip `<think>` tags via system prompts to ensure terminal output remains clean.

### 3. HIGH-Q (Haiku) TIER: Ultra-Fast (~50M+ Tokens / Day)
Built for rapid-fire answers, syntax checking, and basic debugging.
* **Top Models:** Cohere North-Mini-Code, NVIDIA Nemotron-3 Super, and GPT-OSS-120B.

---

## Installation & Setup 

This setup requires roughly **15 minutes of one-time manual configuration**. You will need to authenticate with free AI providers to get your API keys. Once completed, this setup will work indefinitely for free.

### Step 1: Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/)
* [Claude Code CLI](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) (`npm install -g @anthropic-ai/claude-code`)
* OmniRoute (running locally on `http://localhost:20128`)

### Step 2: The 15-Minute Manual API Setup (Crucial)
Open your OmniRoute dashboard at `http://localhost:20128`. You must manually create accounts (usually via Google Auth) and configure the API keys for the following free-tier providers:
* `kiro`, `cloudflare-ai`, `openrouter`, `groq`, `bluesminds`

**Do not proceed to Step 3 until all these providers are connected and showing as active in your OmniRoute dashboard.**

### Step 3: The Autonomous AI Configuration
You do not need to configure the database manually. Simply copy this entire repository link and paste it to your AI assistant (Cursor, Antigravity, or Claude). 

Give the AI the following prompt:
> "Read this repository. I have already configured my providers in OmniRoute. Please clone this repo and run `node setup.js` to autonomously inject the exact Combos, Models, and strict Identity System Messages directly into my OmniRoute database. Then, configure my `~/.claude/settings.json` to point to `http://localhost:20128`."

### Step 4: Link Claude Code to OmniRoute
If you prefer to link it manually, update your Claude Code `settings.json` (located in `~/.claude/settings.json`) to point to the local server:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:20128",
    "ANTHROPIC_AUTH_TOKEN": "sk-dummy-key"
  }
}
```

---

## Troubleshooting & Common Errors

**Error: "There's an issue with the selected model (claude-opus-5[1m]). It may not exist..."**
If you see this error in Claude Code, it means another application has hijacked OmniRoute's port (20128).
* **Why it happens:** Web frameworks like Next.js or React sometimes aggressively search for open ports or read global `PORT` environment variables. If you start a React app without explicitly defining a port, it might accidentally bind to 20128, blocking Claude Code.
* **The Fix:** Always explicitly assign ports to your web servers (e.g., `npx next dev -p 3000`). If port 20128 gets hijacked, simply kill the rogue Node.js process to restore OmniRoute.

---

## Take It To The Next Level: The Orchestra Workflow

This raw Claude Code setup is powerful out of the box. But if you want to push it to the absolute limit for building flawless full-stack architecture, you should integrate my **Orchestra Workflow**.

[Get Orchestra Workflow on GitHub](https://github.com/mahik504/orchestra-workflow)

**What it adds:**
* **Obsidian Brain Integration:** Gives your AI a permanent memory. It learns from your responses, inputs, codebase references, and skills across reboots.
* **Prebuilt Skills & MCPs:** Comes with a massive prebuilt workflow of skills, resources, and MCP servers so you get perfect output right from zero. 

Try out this raw `Limitless Claude` setup first. Once you see how fast and free it is, drop the Orchestra workflow into your workspace and watch it build full-stack apps autonomously.

---

## Support & Contact
If you encounter any issues while setting this up, configuring providers, or discussing AI architecture, feel free to reach out.
**Email:** `gehlot.mahisingh2006.102@gmail.com`

*Built by mahik504. Released under the MIT License.*
