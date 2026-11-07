# Limitless Claude 8.0 - Optional Orchestra Interoperability Report
*Mode B Decoupled Contract Specification*

---

## 1. Architectural Relationship

Limitless Claude 8.0 and Orchestra Workflow are two completely independent engineering systems:
- **Limitless Claude** is an autonomous multi-provider coding agent router and runtime.
- **Orchestra Workflow** is a high-level task coordination and memory harness.

Under **Mode A (Standalone)**, Limitless Claude runs completely on its own.
Under **Mode B (Optional Interoperability)**, `src/integrations/orchestra/adapter.js` acts as a loose consumer of public contracts.

```mermaid
flowchart LR
    Orchestra[Orchestra Control Plane] -->|Public Contract: Task & Constraints| Adapter[src/integrations/orchestra/adapter.js]
    Adapter -->|Mapped Capability: 3D / Frontend / Backend| Router[Limitless Claude 8.0 Core]
    Router -->|Inference Execution| Upstream[Multi-Provider LLMs]
```

---

## 2. Capability Mapping Matrix

| Orchestra Task / Domain | Limitless Capability Profile | Recommended Tier |
| :--- | :--- | :--- |
| `award-style site`, `taste-design` | `frontend` | `limitless-opus-4.6` |
| `one 3d scene`, `r3f-shaders` | `3d` | `limitless-opus-4.6` |
| `saas or api`, `postgres-rls` | `backend` | `limitless-opus-4.6` |
| `architecture diagram`, `grilling` | `reasoning` | `limitless-sonnet-5.5` |
| `fast syntax patch`, `atomic edit` | `fast` | `limitless-haiku-4.5` |
| `hostile review`, `anti-slop audit`| `review` | `limitless-sonnet-5.5` |
| `technical docs`, `paper` | `documentation` | `limitless-sonnet-5.5` |

---

## 3. Invariants & Safety Guarantees

1. **Zero Core Coupling**: Core runtime files (`src/core/*`) never import Orchestra.
2. **Safe Fallback**: If Orchestra is absent or unconfigured, the adapter safely falls back to standalone defaults without errors.
3. **Single Conductor**: Orchestra coordinates workflows; Limitless Claude manages model routing, prompt composition, and protocol execution. No competing conductors.
