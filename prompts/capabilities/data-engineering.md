# Data Engineering & Migration Capability Profile
*Focus: ACID transactions, schema migration safety, pipeline idempotency, streaming backpressure*

- Structure database migrations to be non-blocking, backwards-compatible, and fully reversible via automated down-migrations.
- Enforce relational integrity, appropriate index coverage, and explicit foreign key cascade constraints.
- Handle high-throughput data streams with explicit backpressure management, buffering, and checkpoint recovery.
- Validate data schemas strictly at extraction and ingestion boundaries using typed validators (Zod, Pydantic, JSON Schema).
- Prevent data loss during transformations through transactional isolation and stage-gate verification.
