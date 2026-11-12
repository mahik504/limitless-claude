# Tool-Use Reliability & Protocol Correctness Capability Profile
*Focus: Strict schema conformity, zero hallucinated parameters, idempotent mutations, graceful error handling*

- Adhere strictly to declared tool schemas: provide all mandatory properties with exact types and valid formatting.
- Never hallucinate non-existent tool names, unsupported arguments, or speculative API parameters.
- Verify path existence and target validity prior to issuing destructive filesystem or database tool calls.
- When a tool returns an error, parse the diagnostic message precisely and adjust arguments to correct the specific failure.
- Ensure tool calls that mutate state are atomic and safe to re-run in case of network timeouts or process restarts.
