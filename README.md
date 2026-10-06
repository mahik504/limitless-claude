
# Limitless Claude ??

An ultimate OmniRoute + Claude Code architecture that unlocks God-Mode coding via intelligent model tiering, automatic rate-limit cascading, and 170+ model aggregation.

## Features

- **OmniRoute Integration**: Connects dynamically to your local OmniRoute server (`127.0.0.1:20128`).
- **4-Tier Architecture**:
  - **Haiku Tier**: Fastest reliable models for speed tasks.
  - **Sonnet Tier**: Deep reasoning, planning, and system architecture.
  - **Opus Tier**: The massive free coding reservoir (Copilot, OpenRouter Free, Gemini).
  - **Fable Tier**: Premium God-Mode models (o1-preview, claude-3.5-sonnet).
- **Zero-Friction UI**: Modifies the OmniRoute schema to perfectly restrict Claude Code, showing ONLY our 4 tiers instead of 180+ confusing upstream models.
- **Auto-Boot**: Automatically adds OmniRoute to Windows Startup so it starts silently when you boot your laptop.

## Project Structure

```
limitless-claude/
+-- src/            # Core logic and configuration
+-- scripts/        # Setup and validation scripts
¦   +-- discover.js # Fetches available providers and models
¦   +-- setup.js    # Injects Combos, restricts API keys, configures Claude
+-- config/         # JSON inventory of models and benchmarks
+-- tests/          # Architecture tests
+-- docs/           # Documentation and guides
```

## Quick Start

1. Install OmniRoute:
   ```bash
   pnpm add -g omniroute@latest
   omniroute serve
   ```
2. Clone this repository and run the setup script:
   ```bash
   npm install better-sqlite3
   node scripts/setup.js
   ```
3. Open Claude Code and enjoy Limitless power!

