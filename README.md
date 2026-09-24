# Limitless Claude ðŸš€

**Supercharge your Claude Code CLI and VS Code Extension with unlimited, god-tier AI models.**

Limitless Claude is an advanced proxy, mapping, and orchestration layer designed to completely unlock your Claude Code environment. Instead of being restricted to limited official models, Limitless Claude dynamically bridges Claude Code to the **OmniRoute** backend, giving you instant access to the greatest frontier models on the planetâ€”entirely for free, or perfectly balanced with your paid API keys.

---

## 🚀 Supported Providers (The Limitless Stack)

To get the exact God-Mode setup out of the box, configure these 19 providers in your OmniRoute server before running the setup. (Don't worry if you miss some—`setup.js` dynamically adapts the Fable/Opus/Sonnet tiers to use the absolute best available models you have connected).

1. AgentRouter
2. Antigravity *(Paid)*
3. Bluesminds
4. Cerebras
5. Cloudflare AI
6. DeepSeek
7. DuckDuckGo
8. GitHub Copilot *(Paid)*
9. Groq
10. HuggingChat
11. Kilo-Gateway
12. Kiro
13. Mistral
14. Muse-Spark Web
15. Nvidia
16. Ollama Cloud
17. OpenCode
18. OpenRouter
19. Qwen Web

---

## 🛠️ Installation & Setup

**The easiest way to install Limitless Claude is to have your AI agent (Cursor, Antigravity, or Claude Code itself) do it for you.** 

Copy and paste the prompt block below directly into your AI Assistant:

> **Install Limitless Claude for me.**
> 1. Install Claude Code and all of its dependencies globally.
> 2. Ensure I have OmniRoute installed and running locally.
> 3. Read the 19 supported providers above, and guide me on how to add their free/paid API keys to OmniRoute if they are missing.
> 4. Once my providers are configured, run `npm install` and `npm run setup` in this repository.
> 5. The setup script will automatically map my current providers to the Limitless Fable, Opus, Sonnet, and Haiku combos based on their best capabilities. (Fable = absolute best, Haiku = fast, Sonnet = reasoning/architecture, Opus = heavy logic).
> 6. Run `node validate.js` to run the testing block. Verify that the combos are made perfectly, the Claude Code extension connects flawlessly, and there are no duplicate mappings or UI errors.

### Manual Setup (For Humans)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mahik504/limitless-claude.git
   cd limitless-claude
   ```

2. **Run the Injector:**
   ```bash
   npm run setup
   ```
   *This scans your 19 providers, connects to your local OmniRoute instance, writes the god-tier combo tables, restricts messy API keys, and securely syncs your `~/.claude/settings.json`.*

3. **Verify the Connection:**
   ```bash
   node validate.js
   ```

4. **Code Like A God:**
   Open the Claude Code extension in VS Code. You will instantly see your new, clean Limitless Tiers ready for action!
