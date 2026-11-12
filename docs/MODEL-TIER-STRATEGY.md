# Limitless Claude — Comprehensive Model Tier Strategy
**Architecture Revision**: 8.3.0  
**Tiers Configured**: 6 Dedicated Workload Tiers  
**Document Revision**: November 2026  

---

## 1. Design Philosophy of the 6-Tier Architecture

A common failure in multi-provider routers is treating model routing as a flat, single-metric leaderboard. In reality, software engineering tasks have vastly divergent requirements:
- A syntax linting task demands **sub-second latency and zero token waste**, where frontier reasoning is unnecessary overhead.
- An end-to-end multi-file refactor demands **massive context windows and precise tool-call adherence**, where weak model mistakes compound into catastrophic context corruption.
- General conversation demands **high nuance and clear explanation**, while automated background agents demand **strict parameter compliance and idempotency**.

Limitless Claude configures **6 distinct model tiers**, each assigned a dedicated workload objective, explicit fallback order, and resilience SLA:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        6 SPECIALIZED MODEL TIERS                       │
├────────────────────────────┬───────────────────────────────────────────┤
│ Tier 1: Claude Haiku       │ Fast Syntax, Sub-Second Execution         │
│ Tier 2: Claude Sonnet      │ Deep Planning, System Architecture        │
│ Tier 3: Claude Opus        │ End-to-End Agentic Coding & Refactoring   │
│ Tier 4: Claude Fable       │ Premium Intelligence & Formal Synthesis   │
│ Tier 5: Desktop Chat       │ Conversational Nuance in Claude Desktop   │
│ Tier 6: Desktop Cowork     │ Automation & Agent Tools in Desktop       │
└────────────────────────────┴───────────────────────────────────────────┘
```

---

## 2. In-Depth Tier Specifications

### Tier 1: Claude Haiku (Fast & Inexpensive Execution)
- **Workload Objective**: Instantaneous micro-edits, variable renames, syntax error fixes, AST linting, unit test stubs, classification, and sub-second tool responses.
- **Latency SLA**: $< 500\text{ms}$ TTFT (Time-to-First-Token).
- **Target Context**: 32k – 128k tokens.
- **Candidate Fallback Waterfall**:
  1. `kiro/claude-haiku-4.5` (Primary: authentic Claude instruction adherence, ~380ms)
  2. `cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast` (Fallback 1: zero-marginal-cost, 128k context)
  3. `github/gpt-4o-mini` (Fallback 2: subscription-entitled, reliable tool calling)
  4. `groq/openai/gpt-oss-20b` (Fallback 3: ultra-fast inference, ~180ms TTFT)
  5. `cloudflare-ai/@cf/zai-org/glm-4.7-flash` (Fallback 4: fast secondary mirror)
  6. `cloudflare-ai/@cf/meta/llama-3.2-3b-instruct` (Fallback 5: emergency lightweight fallback)

---

### Tier 2: Claude Sonnet (Deep Reasoning & Architecture Planning)
- **Workload Objective**: First-principles problem decomposition, system design, architectural trade-off analysis, complex debugging, code comprehension, and planning before implementation.
- **Latency SLA**: $< 1.5\text{s}$ TTFT.
- **Target Context**: 128k – 200k tokens.
- **Candidate Fallback Waterfall**:
  1. `kiro/claude-sonnet-4.5` (Primary: state-of-the-art software reasoning and tool compliance)
  2. `github/gpt-4o-2024-11-20` (Fallback 1: enterprise frontier model, 128k context)
  3. `kiro/glm-5` (Fallback 2: high-reasoning frontier model)
  4. `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` (Fallback 3: zero-marginal-cost thinking model with `<think>` blocks)
  5. `kiro/qwen3-coder-next` (Fallback 4: specialized code reasoning)
  6. `kiro/deepseek-3.2` (Fallback 5: high-capacity reasoning fallback)

---

### Tier 3: Claude Opus (Advanced Agentic Software Development)
- **Workload Objective**: Autonomous end-to-end development loops, multi-file atomic edits, complex refactoring, test generation, test-runner execution, and long-horizon feature implementation.
- **Latency SLA**: $< 2.0\text{s}$ TTFT.
- **Target Context**: 128k – 256k tokens.
- **Candidate Fallback Waterfall**:
  1. `mistral/codestral-latest` (Primary: dedicated code FIM model, 256k context)
  2. `kiro/claude-sonnet-4.5` (Fallback 1: highest tool-calling fidelity)
  3. `xkiro/mistralai/codestral-2508` (Fallback 2: subscription mirror)
  4. `kiro/qwen3-coder-next` (Fallback 3: state-of-the-art coding benchmark leader)
  5. `kiro/glm-5` (Fallback 4: high-capacity agent execution)
  6. `cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct` (Fallback 5: zero-marginal-cost code specialist)
  7. `github/gpt-4o-2024-11-20` (Fallback 6: robust multi-file agent fallback)
  8. `antigravity/claude-opus-4-6-thinking` (Fallback 7: high-tier reasoning reservoir)

---

### Tier 4: Claude Fable / Paper (Premium Intelligence & Synthesis)
- **Workload Objective**: Premium intelligence, complex theoretical research, difficult architectural verdicts, formal verification, synthesis of dense documentation, academic paper analysis, and tasks where ordinary models falter.
- **Latency SLA**: $< 3.0\text{s}$ TTFT (Reasoning quality prioritized over speed).
- **Target Context**: 128k – 200k tokens.
- **Candidate Fallback Waterfall**:
  1. `kiro/claude-sonnet-4.5` (Primary: highest empirical reasoning ceiling)
  2. `github/gpt-4o-2024-11-20` (Fallback 1: cross-provider frontier benchmark anchor)
  3. `xkiro/mistralai/mistral-large-2512` (Fallback 2: large-scale synthesis specialist)
  4. `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` (Fallback 3: massive 550B parameter synthesis engine under $10 deposit tier)
  5. `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` (Fallback 4: deep step-by-step mathematical reasoning)

---

### Tier 5: Claude Desktop Chat (General Conversation)
- **Workload Objective**: Conversational interaction, conceptual explanation, knowledge work, brainstorming, and writing assistance inside Claude Desktop environments.
- **Latency SLA**: $< 1.5\text{s}$ TTFT.
- **Candidate Fallback Waterfall**:
  1. `kiro/claude-sonnet-4.5` (Primary: authentic conversational depth)
  2. `github/gpt-4o-2024-11-20` (Fallback 1: balanced conversational fluidity)
  3. `xkiro/mistralai/mistral-large-2512` (Fallback 2: high-context synthesis)
  4. `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` (Fallback 3: zero-marginal-cost conversational engine)
  5. `cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` (Fallback 4: analytical problem solving)

---

### Tier 6: Claude Desktop Cowork / Automation (Tool-Heavy Desktop Agent)
- **Workload Objective**: Multi-step file manipulation, MCP tool orchestration, workspace searches, and automated actions initiated from desktop workflows.
- **Latency SLA**: $< 2.0\text{s}$ TTFT.
- **Candidate Fallback Waterfall**:
  1. `kiro/claude-sonnet-4.5` (Primary: strict schema adherence and tool safety)
  2. `github/gpt-4o-2024-11-20` (Fallback 1: robust tool call execution)
  3. `xkiro/mistralai/mistral-large-2512` (Fallback 2: structured parameter parsing)
  4. `kiro/glm-5` (Fallback 3: agentic workflow execution)
  5. `kiro/deepseek-3.2` (Fallback 4: multi-turn tool stability)

---

## 3. Dynamic Task Pinning Override Policy

When a developer needs to guarantee that a specific task profile always runs against an exact model (e.g., pinning backend work to `kiro/claude-sonnet-4.5` or fast syntax to `groq/openai/gpt-oss-20b`), Limitless Claude provides the **Task Pinning Engine** (`limitless pin`):
- Pinned models are automatically prioritized to **Index 0** in candidate resolution for that task profile.
- Unpinned tasks continue using the balanced fallback waterfall.
- All pins are stored persistently in `config/task-pins.json` and can be inspected via `limitless pin --list` or cleared via `limitless pin --reset`.
