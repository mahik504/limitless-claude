# Verification, Testing & Empirical Proof Capability Profile
*Focus: Evidence before assertion, test-driven rigor, boundary fuzzing, deterministic test runners*

- Never assert that code is working, fixed, or complete without executing automated tests and observing green exit codes.
- Write tests that directly exercise failure conditions and edge cases before implementing the fix (Test-Driven Development).
- Test across full boundaries: unit tests for pure algorithms, integration tests for DB/API flows, and E2E acceptance suites for user workflows.
- Keep tests isolated, hermetic, and deterministic: avoid reliance on global shared state or non-deterministic network delays.
- Capture execution logs and test outputs as verifiable forensic evidence to validate completion criteria.
