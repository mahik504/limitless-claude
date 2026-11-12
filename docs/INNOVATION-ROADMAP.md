# Limitless Claude — Advanced Innovation & Future Architecture Roadmap
**Horizon**: 2026–2027 Engineering Architecture  
**Document Revision**: November 2026  

---

## 1. Executive Vision

While Limitless Claude 8.3 delivers complete multi-provider compatibility, 6-tier routing, and granular state protection, the rapid evolution of autonomous coding agents demands continuous innovation. This roadmap outlines the advanced capabilities scheduled for implementation, prioritized by measurable developer benefit and system maintainability.

---

## 2. Priority 1: Trajectory-Aware Adaptive Escalation (CAF Loop)

### Problem
Single-turn prompt routers evaluate task complexity based solely on the user's initial prompt string. However, a task that appears simple ("Fix the typo in auth.js") may uncover deep architectural concurrency bugs once executed. Conversely, starting every task on an expensive frontier model incurs severe financial waste.

### Solution: Context-Action-Feedback (CAF) Dynamic Escalation
- **Phase A (Low-Cost Probe)**: Dispatches initial reconnaissance or micro-patches to **Haiku Tier** (`kiro/claude-haiku-4.5` or `cloudflare-ai/llama-3.3-70b`).
- **Phase B (Execution Grounding)**: Inspects tool execution feedback:
  - If compiler or unit tests return green, the task terminates successfully at $<10\%$ standard cost.
  - If tests fail with semantic or architectural errors, the escalation engine intervenes.
- **Phase C (Seamless Tier Escalation)**: Preserves the execution trace and escalates the repair turn to **Sonnet Tier** or **Opus Tier** (`kiro/claude-sonnet-4.5` / `mistral/codestral-latest`).
- **Anti-Thrashing Guard**: A maximum of 2 escalation steps per turn to prevent runaway loops.

---

## 3. Priority 2: Session-Aware Prompt Cache Preservation

### Problem
When a router switches between upstream providers mid-conversation (e.g., from Kiro to Cloudflare AI to GitHub), prompt caching state is lost, causing each provider to re-ingest the full 50k–100k token conversation history at full latency and cost.

### Solution: Session Affinity with Soft Pinning
- Bind multi-turn conversations to a consistent primary provider session (`session_account_affinity` table in SQLite).
- Only trigger provider switching when a hard circuit breaker trips (HTTP 429, 5xx, or persistent timeout).
- Maximize provider-side prompt cache hit rates ($>90\%$ cache read discount on Anthropic-compatible endpoints).

---

## 4. Priority 3: Local Ollama Auto-Discovery & Zero-Cost Hybrid Router

### Problem
Many developers possess powerful local GPUs (e.g., NVIDIA RTX 4090 / 5090) capable of running high-performance coding models (Qwen 2.5 Coder 32B, DeepSeek R1 32B), but switching between cloud gateways and local engines requires manual reconfiguration.

### Solution: Automated Local-First Hybrid Cascades
- Limitless Claude includes the **Ollama Auto-Discovery Engine** (`src/core/ollama-discovery.js`).
- If a local Ollama instance on `127.0.0.1:11434` is detected online, Limitless Claude automatically discovers installed models and can insert them as Index 0 candidates in the Haiku and Opus tiers.
- If Ollama is offline or experiences GPU out-of-memory errors, the cascade falls back seamlessly to cloud zero-marginal-cost endpoints (Cloudflare Workers AI, Groq).

---

## 5. Priority 4: Autonomous Configuration Self-Repair Engine

### Problem
Developers frequently encounter broken environments due to corrupted JSON files, revoked API tokens, or port conflicts, requiring tedious manual troubleshooting.

### Solution: Narrowly-Scoped Automated Repair (`limitless repair`)
- **Safe Diagnostic Probing**: `limitless doctor` identifies broken state.
- **Targeted Repair Actions**:
  - Re-resolves authorized API keys from `storage.sqlite` if `~/.claude/settings.json` is out of sync.
  - Removes recursive combo references and canonicalizes duplicate provider aliases.
  - Fixes database permissions and ensures WAL mode is active.
- **Safety Boundary**: Never deletes databases, never resets working provider accounts, and always creates pre-repair rollback snapshots (`storage.sqlite.bak`).
