## Limitless Claude 8.1.0 Release Notes

Limitless Claude 8.1.0 delivers frictionless onboarding with one-line automated installers, a self-healing initialization wizard, task-to-model pinning, granular file undo, and verified clean routing combos across all four tiers.

### 1. One-Line Cross-Platform Installers
New users can install and configure Limitless Claude with a single terminal command:
- **Windows (PowerShell):**
  ```powershell
  irm https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.ps1 | iex
  ```
- **macOS & Linux (Terminal):**
  ```bash
  curl -fsSL https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.sh | bash
  ```
The installer checks prerequisites, installs dependencies, registers the global `limitless` CLI command, auto-starts the local gateway, provisions a local API key, and synchronizes routing tiers.

### 2. Self-Healing Initialization Wizard (`limitless init`)
The initialization wizard now automatically heals common environment gaps:
- Gateway check: Detects if the OmniRoute daemon is stopped on port 20128 and launches it in the background.
- Key auto-provisioning: If no active API key exists in `storage.sqlite`, automatically provisions a local API key with full combo permissions.
- Client auto-configuration: Automatically configures `~/.claude/settings.json` with the local gateway base URL (`http://localhost:20128`) and auth token.

### 3. Task-to-Model Pinning (`limitless pin`)
Assign dedicated model endpoints to specific engineering tasks:
```bash
limitless pin --task backend --model kiro/claude-sonnet-4.5
limitless pin --task fast --model groq/openai/gpt-oss-20b
limitless pin --list
limitless pin --remove backend
```
Pinned models take immediate priority (index 0) during candidate selection for matching capability profiles.

### 4. File-Level Checkpoints & Instant Undo (`limitless checkpoint` & `limitless undo`)
Captures atomic snapshots of modified files before autonomous loops without polluting git history:
```bash
limitless checkpoint --create "pre-refactor auth" src/auth.js src/db.js
limitless undo --dry-run
limitless undo
```
Snapshots are recorded with SHA-256 integrity hashes in `.limitless/checkpoints/` and can be restored individually.

### 5. Verified Clean Routing Combos
Every endpoint across all four composite tiers has been smoke-tested against live HTTP 200 responses to eliminate deprecation notices and dead endpoints:
- **Haiku Tier (6 Models):** Kiro Claude Haiku 4.5, Cloudflare LLaMA 3.3 70B, GitHub GPT-4o Mini, Groq LPU, Cloudflare GLM 4.7 Flash, OpenRouter Nemotron 3.5 Free.
- **Sonnet Tier (6 Models):** Kiro Claude Sonnet 4.5, Kiro GLM-5, GitHub GPT-4o, Cloudflare DeepSeek R1, Kiro Qwen3 Coder, Kiro DeepSeek 3.2.
- **Fable Tier (5 Models):** Kiro Claude Sonnet 4.5, GitHub GPT-4o, Mistral Codestral, Kiro GLM-5, Cloudflare DeepSeek R1.
- **Opus Tier (23 Models):** Mistral Codestral, Kiro Sonnet/GLM/Qwen/DeepSeek/MiniMax, Cloudflare Qwen 2.5 Coder, DeepSeek R1, LLaMA, GitHub GPT-4o, Groq LPU, and OpenRouter free models.

### 6. Verification Results
- Unit & Contract Tests: 91/91 passed (13 test suites)
- System Diagnostic Doctor: 15/15 passed (Orchestra Mode B Active)
- Tier Connectivity (`limitless verify`): 8/8 routes HTTP 200 OK
- End-to-End Acceptance: 6/6 passed
- Prompt Laboratory: 4/4 fixtures passed (100% score)
