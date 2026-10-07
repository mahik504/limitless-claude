# Limitless Claude v4.3.2

A local omnirouting architecture that connects Claude Code to a massive, auto-switching fleet of AI models. It eliminates rate limits, prevents downtime, and maximizes your free coding token reservoir -- all while keeping the full Claude Code experience intact.

This acts as a transparent, system-level proxy. When Claude Code attempts to communicate with the Anthropic API, Limitless Claude intercepts the traffic and routes it to `http://127.0.0.1:20128`.

The current Claude model lineup this architecture is designed around:
- Claude Opus tier combo (17 Models)
- Claude Fable tier combo (10 Models - includes Paid OpenRouter models)
- Claude Haiku tier combo (7 Models)
- Claude Sonnet tier combo (6 Models)

The system prompt injected into each tier is grounded directly from the official Anthropic system instructions, ensuring that even when a request cascades to a non-Anthropic model, the output quality, formatting, and tool-call behavior remain consistent with a native Claude experience. We dynamically inject specific prompts depending on the tier (Haiku architecture for Haiku, Sonnet reasoning for Sonnet, etc.).

---

## Architecture

```mermaid
flowchart TD
    subgraph Client
        CC[Claude Code CLI / Extension]
    end

    subgraph Limitless Proxy
        OR[OmniRoute on 127.0.0.1:20128]
        subgraph Tiers
            H[Haiku - Speed]
            S[Sonnet - Reasoning]
            O[Opus - Free Coding]
            F[Fable - Paid / God-Mode]
        end
    end

    subgraph Providers
        P1[OpenRouter]
        P2[HuggingChat]
        P3[Mistral]
        P4[GitHub Copilot]
        P5[Antigravity]
        P6[BluesMinds]
        P7[Kiro]
        P8[+ More]
    end

    CC --> OR
    OR --> Tiers
    Tiers --> P1
    Tiers --> P2
    Tiers --> P3
    Tiers --> P4
    Tiers --> P5
    Tiers --> P6
    Tiers --> P7
```

---

## The Four Tiers & Configured Models

To ensure rate limits are spread perfectly across providers, models are **interleaved** horizontally (e.g. GitHub -> Antigravity -> OpenRouter -> GitHub) so that no single provider is slammed repeatedly before falling back.

*(Note: The setup script dynamically filters this list. It only builds the tier using the models your specific providers currently offer. If you lack a provider, that model is safely skipped).*

### Haiku -- Speed
The fastest responders. Used for rapid syntax corrections, quick lookups, and low-latency edits.
- `github/gpt-4o-mini`
- `antigravity/gemini-3.1-flash-lite`
- `kiro/qwen3-coder-next`
- `groq/llama-3.1-8b-instant`
- `openrouter/z-ai/glm-5.2:free`
- `openrouter/qwen/qwen3.8-27b:free`
- `openrouter/nvidia/nemotron-3.5-lightning:free`
*Estimated daily tokens: ~1,500,000+ tokens*

### Sonnet -- Reasoning
Dedicated strictly to system design, architecture planning, debugging, and chain-of-thought reasoning. 
- `github/gpt-4o-2024-11-20`
- `antigravity/claude-sonnet-4-6`
- `kiro/glm-5`
- `antigravity/claude-opus-4-6-thinking`
- `bluesminds/deepseek-reasoner`
- `huggingchat/CohereLabs/command-a-reasoning-08-2025`
*Estimated daily tokens: ~2,500,000+ tokens*

### Opus -- Free Coding Reservoir
The massive workhorse tier. We extract every free coding model available across the ecosystem. 100% free models.
- `kiro/qwen3-coder-next`
- `bluesminds/gpt-5.5`
- `kiro/glm-5`
- `openrouter/z-ai/glm-5.2:free`
- `ollama-cloud/glm-5.3`
- `mistral/codestral-latest`
- `openrouter/qwen/qwen3.8-27b:free`
- `bluesminds/kimi-k3`
- `kiro/deepseek-3.2`
- `openrouter/poolside/laguna-s-2.1:free`
- `openrouter/liquid/lfm-2.5-2.6b:free`
- `huggingchat/deepseek-ai/DeepSeek-V4-Pro`
- `huggingchat/Qwen/Qwen3.6-27B`
- `opencode/deepseek-v4-flash-free`
- `opencode/big-pickle`
- `muse-spark-web/muse-spark-thinking`
- `muse-spark-web/muse-spark`
*Estimated daily tokens (with \$10 OpenRouter unlock): ~14,000,000+ free tokens.*

### Fable -- Paid / God-Mode
Reserved exclusively for your paid subscriptions and premium entitlements. This tier uses a **load-balanced (round-robin) strategy** to evenly spread API requests across your premium models, maximizing your dollar.
- `github/gpt-4o-2024-11-20`
- `github/gpt-4o-mini`
- `antigravity/claude-opus-4-6-thinking`
- `antigravity/gemini-3.1-pro-low`
- `antigravity/gemini-3.8-flash-high`
- `openrouter/z-ai/glm-5.3-flash`
- `openrouter/z-ai/glm-5.3`
- `openrouter/qwen/qwen-3.8-coder-32b-instruct`
- `openrouter/moonshotai/kimi-k2.7-code`
- `openrouter/moonshotai/kimi-k3`
*Estimated daily volume: ~10,000,000+ premium tokens.*

---

## Total Network Capacity
When fully configured with the \$10 OpenRouter unlock, this Limitless proxy pushes **~28,000,000 combined tokens per day** seamlessly through your terminal.

---

## The \$10 OpenRouter Tip

By default, OpenRouter limits free model usage to roughly 50 requests per day. However, if you deposit just \$10 into your OpenRouter account, your rate limit for free models jumps from 50 to 1,000 requests per day. You do not actually spend the \$10 -- as long as the balance sits there, you get a permanent 20x boost to your free limits.

Because the Opus tier heavily relies on OpenRouter free models, this single deposit unlocks an estimated **8 million additional free tokens every day**. Because the Fable tier uses load-balancing, your 1000 requests won't all be wasted on a single model.

---

## Supported Providers

The setup script dynamically discovers models from whatever providers you have connected:
- antigravity
- bluesminds
- github (Copilot)
- groq
- huggingchat
- kiro
- mistral
- ollama-cloud
- opencode
- openrouter
- muse-spark-web

If you only have 5 providers connected, the tiers are built from those 5 providers only. Nothing breaks. Nothing is wasted.

---

## Installation

**Prerequisites:**
- Node.js v22 or later
- pnpm installed globally
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)

### Step 1 -- Install and start OmniRoute

```bash
pnpm add -g omniroute@latest
omniroute serve
```

Leave this running for now. The setup script will install a background daemon so you never have to run this manually again.

### Step 2 -- Connect your providers

Open `http://localhost:20128` in your browser and authenticate the providers you want to use (OpenRouter, HuggingChat, GitHub Copilot, etc).

### Step 3 -- Build the tiers

```bash
git clone https://github.com/mahik504/limitless-claude.git
cd limitless-claude
npm install
npm run setup
```

The setup script will:
1. Query your live providers and filter out dead models.
2. Build the four tiers dynamically based only on your active providers.
3. Inject grounded system prompts into all four tiers.
4. Install an invisible auto-recovery daemon. For Windows, it creates a silent VBScript in Startup. For macOS/Linux, use `pm2 start npm --name "omniroute" -- run serve`.

### Step 4 -- Adding new providers later

If you connect a new provider in OmniRoute at any point in the future, just run:

```bash
npm run setup
```

The tiers will be rebuilt automatically with the new models included.

### Step 5 -- Use Claude Code

```bash
claude
```

That is it. Claude Code is now permanently running through the Limitless architecture with full fallback protection. All Claude Code features work natively -- slash commands, `/plan` mode, Ultra Code, agentic execution. It works in any terminal, VS Code, Cursor, or Antigravity IDE. You can also point any other application directly at the `http://127.0.0.1:20128/v1` API.

---

## What happens after 10 days of not using it?

Nothing. On Windows, you turn on your laptop, the invisible daemon boots OmniRoute silently in the background, and when you type `claude` in your terminal it works exactly as before. No manual steps needed. If OmniRoute ever crashes, the daemon catches it and restarts it within 5 seconds.

---

## License

MIT
