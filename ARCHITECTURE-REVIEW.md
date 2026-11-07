# Limitless Claude 8.0 Architecture Review
**Autonomous Multi-Provider Coding Agent Runtime**

---

## 1. System Topology & Architectural Invariants

Limitless Claude operates as an autonomous, provider-neutral coding agent runtime sitting between client developer harnesses and upstream LLM inference providers.

```mermaid
flowchart TD
    subgraph Clients["Client Layer (Mode A - Standalone)"]
        CC[Claude Code CLI / IDE Extension]
        OC[OpenCode CLI / Extension]
        CUR[Cursor AI Editor]
        AGY[Antigravity IDE & CLI]
        GEN[Generic Anthropic / OpenAI Clients]
    end

    subgraph Gateway["Local Gateway Layer (:20128)"]
        Omni[OmniRoute Reverse Proxy Daemon]
        Auth[API Key & Header Permission Gate]
    end

    subgraph CoreRuntime["Limitless Claude 8.0 Core Engine"]
        ACM[Agent Client Protocol Adapter<br/>• Schema Bidirectional Translation<br/>• Tool Call & Result Mapping<br/>• SSE Stream Chunk Normalization]
        PE[Original 5-Layer Prompt Engine<br/>• Constitution • Profiles • Adapters • Context • Contract]
        SM[Session & Context Manager<br/>• Multi-Turn Checkpoints • Compaction • Token Accounting]
        RP[Dynamic Routing Policy<br/>• Priority Waterfall • Circuit Breakers • Fallback Chains]
        CE[Capability Evaluator<br/>• 6 Lifecycle States • Benchmark Truth]
        BC[Fine-Grained Billing Classifier<br/>• 7 Classes • Spending Limits • Free-Only Gate]
    end

    subgraph Providers["Inference Providers"]
        P_GROQ[Groq Fast LPUs]
        P_CF[Cloudflare Workers AI]
        P_KIR[Kiro Frontier Engine]
        P_MIS[Mistral / Codestral]
        P_NVI[NVIDIA NIM]
        P_CER[Cerebras Wafer-Scale]
        P_OR[OpenRouter Free / Paid]
        P_OLL[Ollama Cloud / Local]
    end

    subgraph Interop["Optional Extension (Mode B)"]
        ORCH[src/integrations/orchestra<br/>• Loose Public Contract Consumer<br/>• Zero Core Dependencies]
    end

    Clients -->|HTTP / SSE| Omni
    Omni --> Auth
    Auth --> CoreRuntime
    CoreRuntime --> Providers
    CoreRuntime -.->|Optional Hook (Safe Fallback)| Interop
```

---

## 2. Architectural Invariants

1. **Standalone-First Principle**:
   - The core runtime (`src/core/*`, `bin/*`, `scripts/*`) must never import or require external orchestration frameworks (e.g. Orchestra Brain, Orchestra skills).
   - Mode A is default and complete. Mode B (`src/integrations/orchestra/`) is strictly an optional consumer of public contracts.
2. **Empirical Truth vs Heuristics**:
   - Model capability scores must be backed by benchmark verification or explicitly marked as `ESTIMATED`.
   - Unknown costs must return `{ cost: null, status: 'unknown' }`, never `$0.00`.
3. **Database Integrity & Transaction Safety**:
   - SQLite backups must use WAL-safe transaction checkpoints (`VACUUM INTO` or atomic copy).
   - Pre-switch snapshots and rollback capabilities are enforced for all profile transitions.
4. **Protocol Fidelity**:
   - Upstream conversions between Anthropic Messages format and OpenAI Chat Completions format must preserve full tool semantics, argument types, and error descriptions without dropping data.

---

## 3. Subsystem Architectural Specifications

### 3.1 Original 5-Layer Prompt Engine
The prompt engine decomposes system instructions into orthogonal layers:
- **Layer 1: Universal Engineering Constitution** (`prompts/universal/`): Anti-slop, verification before assertion, zero empty stubs, idempotency, strict typing.
- **Layer 2: Capability Profiles** (`prompts/capabilities/`): Specializations for Fast, Balanced, Reasoning, Frontend, 3D, Backend, and Review.
- **Layer 3: Provider/Model Adapters** (`prompts/providers/`): Specific formatting rules (e.g., DeepSeek R1 `<think>` delimiters, Kiro Claude XML blocks, Mistral syntax flags).
- **Layer 4: User/Project Context** (`prompts/context/`): Ingests project guidelines (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Cursor rules).
- **Layer 5: Tool & Execution Contract** (`prompts/contracts/`): Strict tool-use format specifications and safety constraints.

### 3.2 Bidirectional Protocol Adapter
Handles schema mapping across heterogenous clients and models:
- **Anthropic Messages**: `system` (top-level), `tools` (`name`, `description`, `input_schema`), messages with `tool_use` and `tool_result`.
- **OpenAI Chat**: `messages[0]` (`role: 'system'`), `tools` (`type: 'function'`, `function: { name, description, parameters }`), `tool_calls` and `role: 'tool'`.
- **Streaming Parser**: Real-time event transformation preserving incremental token delivery.

### 3.3 Context & Session Management
- **Sliding-Window Compaction**: Retains active objectives, file paths, and recent tool interactions while truncating repetitive terminal dumps.
- **Token Accounting**: Accurately tracks input, output, cached, and tool tokens against upstream limits.
- **Session Checkpoints**: Allows instantaneous rollback of agent state when an upstream turn encounters an unrecoverable failure.
