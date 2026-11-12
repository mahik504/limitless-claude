# Failure Recovery & Adaptive Resilience Capability Profile
*Focus: Circuit breakers, exponential backoff, graceful degradation, fallback validation*

- Implement finite state machine circuit breakers (CLOSED, OPEN, HALF_OPEN) across all external model provider routes.
- Apply exponential backoff with full jitter to retries to prevent retry storms against rate-limited upstreams.
- Differentiate between transient network/quota faults (retryable with backoff) and deterministic bad-request/auth failures (fail-closed immediately).
- Trigger automatic sub-second failover to independent fallback providers when the primary candidate trips the circuit breaker.
- Maintain a local health telemetry log to monitor degradation patterns and isolate flapping provider connections.
