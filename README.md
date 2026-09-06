# 🚀 Limitless Claude

If you are a developer, a student, or someone tired of hitting API limits on premium AI tools, this setup is going to change the way you write software. 

This repository provides an automated installation prompt that you can feed into **Antigravity, Claude, or Codex**. The AI will autonomously configure your local environment to run an **Enterprise-Grade Autonomous AI Agent** using **Claude Code** (both in your terminal and as a VS Code extension)—**completely for free, forever.** 

Instead of relying on a single expensive subscription, this architecture hooks into a massive, load-balanced free-tier fleet of the world’s most powerful open-weights and frontier models via OmniRoute.

---

## 🧠 The Three Custom AI Fleets

### 1. OPUS TIER: The Elite Coding Fleet (100M+ Tokens / Day)
When you ask Claude Code for `opus`, it routes to this heavy-duty algorithmic coding fleet. 
* **The GLM Priority:** We put the Chinese frontier GLM models at the absolute front because they shred complex logic. You get **GLM-5**, **GLM-5.3-Flash**, and **GLM-5.2**.
* **The Backup Coders:** If GLM is busy, it instantly cascades to **DeepSeek 3.2**, **Qwen3-Coder-Next**, and **Claude Sonnet 5**.
* **Total Capacity:** An estimated **~100,000,000+ tokens** pooled every single day exclusively for heavy coding tasks.

### 2. SONNET TIER: The Architecture & Reasoning Fleet (50M+ Tokens / Day)
When you select `sonnet`, you get pure reasoning, brainstorming, and high-level project planning. (We explicitly stripped out all the messy `<think>` tags so the terminal output stays perfectly clean).
* **Top Models:** **NVIDIA Nemotron-3 Super (120B)**, **NVIDIA Nemotron-3 Ultra (550B)**, and **DeepSeek 3.2**.
* **Total Capacity:** **~50,000,000+ tokens per day**.

### 3. HIGH-Q (Haiku) TIER: The Ultra-Fast Fleet (50M+ Tokens / Day)
For rapid-fire answers, syntax checking, and basic debugging.
* **Top Models:** **Cohere North-Mini-Code**, **NVIDIA Nemotron-3 Super**, and **GPT-OSS-120B**.
* **Total Capacity:** **~50,000,000+ tokens per day** of sub-second responses.

---

## 💻 Why Claude Code CLI Wins
1. **Zero UI Bloat:** Standard IDE extensions are heavy. Claude Code is a pure, raw CLI agent. 
2. **True Autonomy:** Claude Code runs bash scripts, spins up servers, reads error logs, and fixes your code natively. Just give it a prompt and watch it take over your terminal.

---

## 🛠️ Installation & Setup (Master Configuration)

You can set this up instantly. You don't even have to do it manually—just give the instructions to your current AI assistant!

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/)
* [Claude Code CLI](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) (Run: `npm install -g @anthropic-ai/claude-code`)
* OmniRoute (running locally on `http://localhost:20128`)

### 2. Configure Your Free Providers
Open your OmniRoute dashboard and add free API keys for the following providers:
* `kiro`, `cloudflare-ai`, `openrouter`, `groq`, `bluesminds`

### 3. The Autonomous Setup
Simply feed this repository link to your **Antigravity, Claude, or Codex** assistant, and ask it to clone the repo and run the setup. The AI will autonomously inject the exact Combos, Models, and strict Identity System Messages directly into your OmniRoute database to perfectly mirror my setup.

```bash
git clone https://github.com/mahik504/limitless-claude.git
cd limitless-claude
npm install better-sqlite3
node setup.js
```

### 4. Link Claude Code to OmniRoute
Your AI assistant will automatically configure your Claude Code `settings.json` (located in `~/.claude/settings.json`) to point to the local server:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:20128",
    "ANTHROPIC_AUTH_TOKEN": "sk-dummy-key"
  }
}
```
**Pro Tip:** Run `claude config set theme dark-ansi` for the best visual experience!

---

## 🌐 Take It To The Next Level: The Orchestra Workflow
This raw Claude Code setup is ridiculously powerful out of the box. But if you want to push it to the absolute limit for building flawless Frontend/Backend architecture, you can integrate my **Orchestra Workflow**.

🔗 **[Get Orchestra Workflow on GitHub](https://github.com/mahik504/orchestra-workflow)**

**What it adds:**
* **Obsidian Brain Integration:** It gives your AI a permanent memory. It learns from your responses, inputs, codebase references, and skills across reboots.
* **Prebuilt Skills & MCPs:** It comes with a massive prebuilt workflow of skills, resources, and MCP servers so you get perfect output right from zero. 

Try out this raw `Limitless Claude` setup first. Once you see how fast and free it is, drop the Orchestra workflow into your workspace and watch it build full-stack apps autonomously.

---

## 📞 Support & Contact
If you encounter any issues while setting this up, configuring providers, or if you just want to talk AI architecture, feel free to reach out to me!
**Email:** `gehlot.mahisingh2006.102@gmail.com`

*Built by mahik504. Released under the MIT License.*
