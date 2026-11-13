# Limitless Claude 8.5.0 — Clean Installation Prompt
**Target**: Fresh Workstations, Clean Environments & New Developers  
**Mandate**: Fully autonomous, zero-friction setup of Limitless Claude and OmniRoute  

---

```markdown
You are instructed to perform a Clean, Autonomous Installation of Limitless Claude on this machine.

### What is Limitless Claude?
Limitless Claude is an independent, production-grade developer control plane and multi-provider routing runtime built around the Claude experience. Operating above a local OmniRoute inference gateway (`http://127.0.0.1:20128`), it connects Claude Code CLI, Claude Desktop (Chat & Cowork modes), VS Code, Cursor, and Antigravity to over 580 models across 16+ global providers with sub-2s priority routing and automated fallback.

### What You Get Out of the Box
- **Claude Code CLI Integration**: Autonomous terminal agent with atomic file editing, bash execution, and test execution.
- **Claude Desktop Third-Party Gateway**: Native desktop experience supporting both Chat (conversational reasoning) and Cowork (agentic tool flows) modes.
- **6 Optimized Routing Tiers**: Limitless Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.2, Desktop Chat, and Desktop Cowork.
- **Official Anthropic Cognitive Directives**: Authentic model-appropriate prompts injected directly into each tier, eliminating persona leakage and enforcing zero-stub code output.
- **Developer Safety Suite**: `limitless pin` for task-to-model binding, `limitless undo` for pre-edit file rollback, zero-exposure secret redaction, and a 16-point diagnostic doctor.

---

### Step-by-Step Clean Installation Protocol

#### 1. System Prerequisites
- Ensure Node.js (>= 22.0.0) and Git are installed:
  ```bash
  node -v
  git --version
  ```

#### 2. Install & Launch OmniRoute Gateway
- Install OmniRoute globally:
  ```bash
  npm install -g omniroute
  ```
- Launch the persistent OmniRoute daemon:
  - On Windows: Run `omniroute-daemon.bat` or execute in a background terminal:
    ```cmd
    start /min cmd /c "npx omniroute serve"
    ```
  - On Linux / macOS:
    ```bash
    nohup omniroute serve > ~/.omniroute/gateway.log 2>&1 &
    ```
- Confirm the gateway responds on `http://127.0.0.1:20128`:
  ```bash
  curl -s http://127.0.0.1:20128/health
  ```

#### 3. Clone & Link Limitless Claude
- Clone the repository:
  ```bash
  git clone https://github.com/mahik504/limitless-claude.git C:\projects\limitless-claude
  cd C:\projects\limitless-claude
  ```
  *(On Linux/macOS, clone to `~/limitless-claude`)*
- Install dependencies and link the CLI globally:
  ```bash
  npm install
  npm link
  ```

#### 4. Configure Provider API Keys
Configure your preferred providers inside OmniRoute (`~/.omniroute/storage.sqlite` or via OmniRoute web dashboard at `http://127.0.0.1:20128`):
- Recommended free and high-capacity providers:
  - **OpenRouter**: Add your API key (see $10 Tip below).
  - **GitHub Models**: Free personal access token for GPT-4o & GPT-4o-mini.
  - **Mistral AI**: Free tier key for Codestral.
  - **Groq Cloud**: Free tier key for ultra-fast Llama 3.3.
  - **Cloudflare Workers AI**: Free daily inference quota.
  - **Kiro / Kilo Gateway**: Multi-account support.

#### 5. Run the Limitless Setup & Prompt Engine
- Execute the setup script to discover live provider models and provision the 6 composite tiers:
  ```bash
  node scripts/setup.js
  ```
- Apply authentic Anthropic model directives and sync configuration:
  ```bash
  node scripts/update-prompts.js
  ```

#### 6. Configure Claude Code CLI
- Ensure `~/.claude/settings.json` points to the local OmniRoute gateway:
  ```json
  {
    "env": {
      "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128",
      "ANTHROPIC_AUTH_TOKEN": "sk-ant-your-omniroute-token"
    },
    "primaryModel": "claude-opus-5-5",
    "modelSettings": {
      "claude-opus-5-5": { "effortLevel": "xhigh" },
      "claude-sonnet-5-5": { "effortLevel": "high" },
      "claude-haiku-5-5": { "effortLevel": "low" },
      "claude-fable-5-2": { "effortLevel": "max" },
      "claude-desktop-chat": { "effortLevel": "high" },
      "claude-desktop-cowork": { "effortLevel": "high" }
    }
  }
  ```

#### 7. Configure Claude Desktop (Third-Party Inference)
- In `%LOCALAPPDATA%\Claude-3p\configLibrary\<UUID>.json`:
  - Set `"modelDiscoveryEnabled": false` to prevent UI freezing.
  - Register the 6 validated tiers:
    - `claude-opus-5-5` (Limitless Opus 5.5)
    - `claude-sonnet-5-5` (Limitless Sonnet 5.5)
    - `claude-haiku-5-5` (Limitless Haiku 5.5)
    - `claude-fable-5-2` (Limitless Fable 5.2)
    - `claude-desktop-chat` (Claude Desktop Chat)
    - `claude-desktop-cowork` (Claude Desktop Cowork)

#### 8. Verify the Entire Installation
- Run the 16-point diagnostic doctor:
  ```bash
  limitless doctor
  ```
- Run the live HTTP 200 connectivity verification:
  ```bash
  limitless verify
  ```
- Run unit and contract tests:
  ```bash
  npm test
  ```
- Launch Claude Code:
  ```bash
  claude
  ```
```

---

### Pro-Tips for Maximum Capacity & Resilience

⚫️ **Tip 1: The OpenRouter $10 Multiplier (1,000 req/day)**  
OpenRouter limits unfunded ($0 balance) accounts to 50 requests/day with heavy queuing. If you deposit a one-time balance of **$10**, OpenRouter permanently raises your limit on all `:free` models (such as `nvidia/nemotron-3-ultra-550b:free`, `cohere/north-mini-code:free`, `liquid/lfm:free`, and `meta-llama/llama-3.3-70b-instruct:free`) from **50 to 1,000 requests per day**. Because these models are free, **$0.00 is deducted from your $10 deposit balance**.

⭐️ **Tip 2: Multi-Account Quota Stacking**  
OmniRoute natively supports multiple accounts per provider. If you configure two or three free accounts for Kiro, GitHub Models, or Mistral, OmniRoute automatically manages session affinity and rotates accounts after an HTTP 429 rate limit with a 120-second cooldown window.

🔹 **Tip 3: Windows Startup Auto-Boot**  
To ensure your OmniRoute gateway is always ready when you turn on your PC:
1. Press `Win + R`, enter `shell:startup`.
2. Place a shortcut to `C:\projects\limitless-claude\omniroute-daemon.bat` in that folder.

🔹 **Tip 4: Sub-Model Task Pinning**  
Lock specific tasks to the best suited model without changing your default tier:
```bash
limitless pin --task backend --model kiro/claude-sonnet-4.5
limitless pin --task fast --model groq/openai/gpt-oss-20b
```
