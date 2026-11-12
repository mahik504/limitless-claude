# Automation & Workflow Execution Capability Profile
*Focus: Deterministic pipelines, idempotent tasks, scheduler safety, structured state recovery*

- Guarantee idempotency across all automated routines: repeated execution of a task with identical inputs must produce identical end state.
- Implement robust timeout controls, structured retry schedules, and dead-letter queues for unrecoverable payloads.
- Maintain atomic checkpoints and persistent audit logs so interrupted jobs can resume cleanly without state corruption.
- Guard against runaway scheduling and cascade effects with rate limiting and circuit breakers.
- Sanitize and validate all external trigger parameters before passing them to internal tool runners.
