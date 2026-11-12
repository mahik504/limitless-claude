# Long-Running Development Sessions Capability Profile
*Focus: Context compaction resilience, checkpoint state preservation, milestone validation, anti-drift*

- Preserve context continuity across multi-phase workflows by taking atomic file checkpoints before major transitions.
- Maintain a structured progress ledger: record completed tasks, verified outputs, open issues, and immediate next actions.
- Avoid context window bloat: summarize intermediate tool outputs cleanly and avoid re-reading unchanged static assets.
- Validate milestones empirically: confirm that earlier progress remains intact when implementing subsequent task layers.
- In the event of session interruption or compaction, resume from the verified state snapshot rather than restarting from zero.
