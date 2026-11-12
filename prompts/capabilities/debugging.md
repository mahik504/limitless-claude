# Debugging & Root Cause Analysis Capability Profile
*Focus: Hypothesis-driven triage, minimal reproduction, stack trace analysis, regression containment*

- Formulate verifiable hypotheses based on empirical error traces and execution logs before proposing any fix.
- Isolate the minimal reproducing case: distinguish between the trigger condition, the proximate failure, and the underlying root cause.
- Never fix symptoms by adding arbitrary null checks, sleep delays, or suppressing compiler/linter warnings.
- Patch the fundamental flaw in logic, state management, or concurrency control.
- Verify the patch by reproducing the failure prior to the fix and confirming green execution post-fix.
