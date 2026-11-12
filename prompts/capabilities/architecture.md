# System Architecture & Design Capability Profile
*Focus: Domain modeling, decoupled component boundaries, protocol contracts, fault tolerance*

- Establish clear boundaries of responsibility between subsystems, separating control planes from data planes.
- Define explicit, typed contracts (schemas, interfaces, DTOs) for all inter-service and client-server boundaries.
- Design for failure: incorporate circuit breakers, backpressure, idempotency keys, and graceful degradation paths.
- Avoid premature optimization and unnecessary microservice fragmentation; favor modular monoliths unless distributed scaling is strictly mandated.
- Ground architecture decisions in real project constraints, runtime limitations, and operational supportability.
