# Limitless Claude Improvement Roadmap

---

## Release 8.0.0 (Immediate Milestone)
- [x] Complete Architectural Audit & Technical Debt Register (`AUDIT.md`, `ARCHITECTURE-REVIEW.md`, `TECHNICAL-DEBT.md`).
- [x] Comprehensive Competitor & Reference Architecture Analysis (`docs/COMPETITOR-ANALYSIS.md`).
- [ ] Critical Correctness: Capability Evaluator lifecycle states (`DISCOVERED` to `PRODUCTION_APPROVED`).
- [ ] Critical Correctness: Fine-grained Billing Classifier (7 classes, unknown returns null, strict free-only mode).
- [ ] Critical Correctness: WAL-safe SQLite backups and atomic config rollbacks.
- [ ] Agent Protocol Compatibility: Full bidirectional Anthropic Messages $\leftrightarrow$ OpenAI Chat tool and streaming adapter.
- [ ] Original 5-Layer Prompt Engine (`src/core/prompt-engine.js` + `prompts/`).
- [ ] Prompt Laboratory (`src/core/prompt-lab.js`) for fixture-based A/B regression testing.
- [ ] Context & Session Intelligence (`session-manager.js`, `context-manager.js`).
- [ ] Expanded Universal CLI (`doctor`, `init`, `status`, `models`, `providers`, `budget`, `prompt`).
- [ ] Standalone Mode Acceptance: 100% independent operation without Orchestra.
- [ ] Optional Orchestra Interop (`src/integrations/orchestra/adapter.js`).
- [ ] Documentation overhaul with zero emoji clutter and 2 Master Agent Prompts.

## Release 8.1.0 (Short-Term Enhancements)
- [ ] Native WebAssembly vector store for local multi-file code indexing.
- [ ] Semantic AST diff analyzer for automated test-driven loop verification.
- [ ] Real-time token streaming visualization in terminal dashboard.

## Release 9.0.0 (Long-Term Vision)
- [ ] Fully decentralized peer-to-peer model cache.
- [ ] Autonomous subagent swarm coordinator with multi-turn branching.
