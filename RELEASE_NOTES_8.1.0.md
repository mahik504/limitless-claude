## What's New in Limitless Claude 8.1.0

Limitless Claude 8.1.0 brings task-to-model pinning, granular file-level checkpoints and undo, and clean verified model tier allocations across all four routing tiers.

### 1. Task-to-Model Pinning (`limitless pin`)
Users can assign dedicated model endpoints to specific engineering tasks, matching the flexibility of custom agent modes:
```bash
limitless pin --task backend --model kiro/claude-sonnet-4.5
limitless pin --task fast --model groq/openai/gpt-oss-20b
limitless pin --list
limitless pin --remove backend
```
Pinned models take immediate priority (index 0) during candidate selection for matching capability profiles.

### 2. File-Level Checkpoints & Instant Undo (`limitless checkpoint` & `limitless undo`)
Captures atomic snapshots of modified files before autonomous loops without polluting git history:
```bash
limitless checkpoint --create "pre-refactor auth" src/auth.js src/db.js
limitless undo --dry-run
limitless undo
```
Snapshots are recorded with SHA-256 integrity hashes in `.limitless/checkpoints/` and can be restored individually.

### 3. Verified Clean Routing Combos
Every endpoint across all four composite tiers has been smoke-tested against live HTTP 200 responses to eliminate deprecation notices and dead endpoints:
- **Haiku Tier (6 Models):** Kiro Claude Haiku 4.5, Cloudflare LLaMA 3.3 70B, GitHub GPT-4o Mini, Groq LPU, Cloudflare GLM 4.7 Flash, OpenRouter Nemotron 3.5 Free.
- **Sonnet Tier (6 Models):** Kiro Claude Sonnet 4.5, Kiro GLM-5, GitHub GPT-4o, Cloudflare DeepSeek R1, Kiro Qwen3 Coder, Kiro DeepSeek 3.2.
- **Fable Tier (5 Models):** Kiro Claude Sonnet 4.5, GitHub GPT-4o, Mistral Codestral, Kiro GLM-5, Cloudflare DeepSeek R1.
- **Opus Tier (23 Models):** Mistral Codestral, Kiro Sonnet/GLM/Qwen/DeepSeek/MiniMax, Cloudflare Qwen 2.5 Coder, DeepSeek R1, LLaMA, GitHub GPT-4o, Groq LPU, and OpenRouter free models.

### 4. Master Installation Prompts
- Added clarification for OmniRoute background daemon start vs. Claude Code launcher.
- Added `--create <tag>` support to `limitless rollback` for clean WAL-safe pre-repair snapshots.

### 5. Verification Results
- Unit & Contract Tests: 91/91 passed (13 test suites)
- System Diagnostic Doctor: 15/15 passed (Orchestra Mode B Active)
- Tier Connectivity (`limitless verify`): 8/8 routes HTTP 200 OK
- End-to-End Acceptance: 6/6 passed
- Prompt Laboratory: 4/4 fixtures passed (100% score)
