# Limitless Claude 7.0.0 — Orchestra 4.1.0 Interoperability & Compatibility Report

**Target Control Plane:** Orchestra Workflow (https://github.com/mahik504/orchestra-workflow)  
**Published Control Plane Release:** v4.0.0  
**Upcoming Control Plane Target:** v4.1.0 (In development in Cursor)  
**Limitless Claude Component:** Autonomous Model Routing & Inference Infrastructure (Executor Layer)  

---

## 1. Architectural Relationship & Governance

Per Orchestra's official contract (`AGENTS.md`), system roles are strictly delineated:

```
ORCHESTRA  = CONTROL PLANE (One Conductor)
SKILLS / MCPs / PLUGINS / LIBRARIES = CAPABILITIES
AGENTS     = EXECUTORS
BRAIN      = MEMORY
REGISTRY   = RESOURCE KNOWLEDGE
```

### Key Compatibility Rules:
1. **Single Conductor Principle:** If two hosts could plan, the chat interface the developer is actively communicating with is the **single conductor**. Limitless Claude operates strictly as an **executor and model router**, never attempting to usurp control plane governance or invent a second planning loop.
2. **Provider-Neutral Truthfulness:** Orchestra mandates that model names must not pick skills and that identities must be truthful. Limitless Claude 7.0 removes fabricated Anthropic tags (`<antml:...>`), ensuring prompt compliance across all upstream models.
3. **Skill & Tool Preservation:** Limitless Claude preserves all skills and MCPs configured on the host (`~/.claude/plugins`, Google Stitch MCP, Playwright, Context7).
4. **Standalone Decoupling:** Limitless Claude functions as a standalone high-availability coding router even if Orchestra is stood down (`skip orchestra`).

---

## 2. Compatibility Audit Checklist

| Requirement | Published Status (v4.0.0) | Target Status (v4.1.0) | Audit Assessment |
| :--- | :---: | :---: | :--- |
| **Routing & Skill Selection** | `Load:` / `Skip:` compliant | Unchanged | **PASS** — Limitless Claude routes inference without overriding skill selection. |
| **System Prompt Neutrality** | Truthful instructions | Truthful instructions | **PASS** — Purged `<antml>` tags and fake identities in setup.js. |
| **Agent Role** | Worker / Executor | Worker / Executor | **PASS** — Operates via `/v1/messages` without second-guessing conductor plans. |
| **MCP Transparency** | Host-level MCPs preserved | Host-level MCPs preserved | **PASS** — Playwright, Stitch MCP, Context7 accessible to Claude Code. |
| **Cross-Repo Sync Test** | Verified on v4.0.0 contract | Target v4.1.0 unreleased | **PENDING** — Cross-repo validation against 4.0.0 passes; 4.1.0 final test pending upstream push. |

---

## 3. Execution Smoke Test

When Claude Code CLI executes with Limitless Claude 7.0 under an Orchestra-managed repository:
1. Orchestra conductor sets task scope and outputs `Load:` and `Skip:`.
2. Claude Code receives instructions via standard Anthropic Messages API.
3. Limitless Claude routes the turn to the optimal healthy model (e.g. `kiro/claude-sonnet-4.5` for architectural reasoning or `mistral/codestral-latest` for multi-file implementation).
4. Tool executions (file edits, bash commands) return cleanly to the conductor.
5. All turns are verified without interference.
