# Limitless Claude 🚀

An ultimate **God-Mode Omnirouting Architecture** designed to seamlessly integrate Claude Code, OmniRoute, and 170+ open-source, free, and premium models into one unified workflow. 

By intelligently intercepting your IDE's requests, Limitless Claude cascades through custom-built tiers of the world's best models—preventing downtime, expanding token reservoirs, and optimizing your coding cost to near zero.

## 🌟 The Vision & Token Reservoirs

Limitless Claude was born from a singular goal: **No more rate limits. No more manual model switching. Absolute God-Mode coding capability.**

Instead of relying on a single Anthropic key, this architecture uses OmniRoute as a local proxy (`127.0.0.1:20128`). We dynamically cluster over 700+ discovered models from 15+ global AI providers into **4 strictly curated, fallback-protected Tiers** based on their IQ, speed, and cost. If a model times out, hits a quota, or fails, the proxy instantly routes your code to the next elite model in the tier—completely invisibly to your Claude Code interface.

By aggregating free tiers across HuggingChat, Kiro, Cloudflare, Mistral, and OpenRouter, **Limitless Opus provides an estimated 10,000,000+ free tokens per day** before ever touching your paid limits.

## 🏗️ Architectural Design

```mermaid
flowchart TD
    subgraph Developer Environment
        CC[Claude Code CLI / IDE]
        Settings[~/.claude/settings.json\nModel: opus]
    end

    subgraph Limitless Architecture
        Proxy[OmniRoute Local Server\n127.0.0.1:20128]
        API_Key[Strict Sandbox API Key\nCatalog Scope: All]
        
        subgraph Combos [The 4 Tiers]
            C1[Limitless Haiku\nFastest Lookups]
            C2[Limitless Sonnet\nPlanning & Architecture]
            C3[Limitless Opus\nMassive Coding Reservoir]
            C4[Limitless Fable\nPremium / God-Mode]
        end
        
        Router[Dynamic Fallback Router\nPriority Strategy]
    end

    subgraph The Provider Grid
        P1[GitHub Copilot]
        P2[OpenRouter]
        P3[Antigravity]
        P4[HuggingChat]
        P5[Cloudflare AI]
        P6[10+ More...]
    end

    CC -- "POST /v1/messages" --> Proxy
    Proxy -- "Auth & Map Alias" --> API_Key
    API_Key --> Combos
    Combos --> Router
    Router -- "Cascading Requests" --> P1
    Router -- "Fallback" --> P2
    Router -- "Fallback" --> P3
    Router -.-> P4
```

## 🔋 The 4-Tier Blueprint (IQ & Capabilities)

Our `setup.js` pipeline dynamically queries your live providers and builds the following intelligent tiers:

1. **Haiku Tier (`limitless-haiku`) | Speed IQ**: The absolute fastest responders. Used for rapid, latency-sensitive edits, syntax corrections, and quick lookups. Contains ultra-fast models (e.g. Gemini 3.8 Flash, DeepSeek V4 Flash).
2. **Sonnet Tier (`limitless-sonnet`) | Reasoning IQ**: Dedicated to system design, architecture planning, and rigorous chain-of-thought reasoning. Contains heavy reasoning models like `qwq-32b`, `command-a-reasoning`, and `claude-opus-4-6-thinking`.
3. **Opus Tier (`limitless-opus`) | Coding IQ**: Our massive, uncapped, God-Mode free coding reservoir. It aggregates ALL unused free models across OpenRouter, HuggingChat, Mistral, Kiro, and Cloudflare to maximize your daily token limit. *Note: Antigravity and GitHub models are strictly excluded from this tier to preserve their quotas.*
4. **Fable Tier (`limitless-fable`) | God-Mode IQ (PAID)**: The budget-protected, highest-tier premium capabilities. **This tier is strictly for your paid APIs and subscriptions.** It is pre-configured for heavy payloads leveraging AgentRouter ($138 credit), GitHub Copilot entitlements, Antigravity Pro, and OpenRouter paid models (like o1-preview, claude-3.5-sonnet, and glm-5.3-flash). It is designed to extract maximum capability-per-dollar when you need absolute perfection.

---

### 💡 PRO TIP: The $10 OpenRouter Hack
Want to drastically increase your Opus Tier's free coding reservoir? 
By default, OpenRouter limits free model usage to about 50 requests per day. However, **if you credit just $10 to your OpenRouter account, your limit for FREE models automatically increases from 50 to 1,000 requests per day!** 
Because Limitless Claude heavily utilizes OpenRouter's free models (`qwen3.8-27b:free`, `glm-5.2:free`, `laguna-s:free`) in the Opus Tier, this $10 investment unlocks a permanent reservoir of roughly **8 million additional free tokens every single day**, without you ever actually spending the $10 credit on paid APIs.

---

## 🔌 Supported Providers

Limitless automatically harvests models from your active configurations:
- `agentrouter`
- `antigravity`
- `bluesminds`
- `cloudflare-ai`
- `github` *(Copilot Entitlements)*
- `groq`
- `huggingchat`
- `kiro`
- `mistral`
- `ollama-cloud`
- `opencode`
- `openrouter`
- `qwen-web`

## ⚙️ Installation & Workflow

We have streamlined this project to be completely zero-friction. 

**Prerequisites:** 
- Node.js (v22+)
- `pnpm` installed globally
- Ensure you have Claude Code installed (`npm install -g @anthropic-ai/claude-code`)

### 1. Install & Boot OmniRoute
```bash
pnpm add -g omniroute@latest
omniroute serve
```
*(Leave this running for now. Limitless will automatically install a silent background daemon in the next step so you never have to run this manually again).*

### 2. Configure Providers in OmniRoute
Go to the OmniRoute dashboard (`http://localhost:20128`) and authenticate your desired providers (e.g. OpenRouter, HuggingChat, Copilot).

### 3. Build Limitless Claude Tiers
Clone this repository and build your architecture:
```bash
git clone https://github.com/mahik504/limitless-claude.git
cd limitless-claude
npm install
npm run setup
```

The `setup.js` script will:
1. Scan your actively configured providers.
2. Filter dead models.
3. Dynamically construct the 4-Tier system based *only* on the models you have available.
4. Overwrite your API keys to bypass rate limits.
5. Inject official Anthropic System Prompts into the routing tier to guarantee output quality remains identical, even when cascading to models like Qwen or Gemini.
6. Install an **invisible, 100% uptime auto-recovery daemon** to your Windows Startup. Even if you turn off your laptop for 10 days, OmniRoute will boot silently in the background on day 11, auto-restarting if it ever crashes.

### 4. Adding New Providers Later
If you ever add a new provider to OmniRoute in the future, simply open this repository and run:
```bash
npm run setup
```
Limitless will instantly rebuild, benchmark, and prioritize your combos incorporating the new models, completely automatically.

### 5. Run Claude Code
Open your terminal and type:
```bash
claude
```
Your CLI is now permanently running through `limitless-opus` with total fallback protection. No 403s, no hangs, no limits. It natively supports Claude Code's full UI, Slash commands (`/plan`), Ultra Code capabilities, and Agentic execution inside any terminal, VS Code, or Cursor.
