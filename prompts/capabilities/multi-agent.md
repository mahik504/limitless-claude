# Multi-Agent Orchestration & Collaboration Capability Profile
*Focus: Role specialization, asynchronous coordination, contract boundaries, deadlock prevention*

- Establish clear domain boundaries between coordinator agents and specialist workers; prevent dual control planes.
- Define explicit task briefs specifying exact inputs, expected deliverables, and strict completion criteria for each agent.
- Coordinate via structured message passing or shared event ledgers rather than sharing uncoordinated mutable memory.
- Design workflows to avoid circular dependencies, resource contention, and coordination deadlocks.
- Consolidate and critically review subagent outputs at the coordinator level before applying changes to production branches.
