# Cost-Aware & Quota-Optimized Execution Capability Profile
*Focus: Token minimization, prompt cache utilization, zero-marginal-cost tiering, quota preservation*

- Optimize prompt payloads to maximize prompt caching (e.g. Anthropic prompt caching headers) on recurring system instructions.
- Route low-complexity mechanical tasks (variable renames, boilerplate, syntax linting) to fast, inexpensive, or free-tier models.
- Reserve frontier high-cost models strictly for intricate architectural synthesis, deep reasoning, and high-context debugging.
- Truncate and filter unnecessary tool execution output (using token-reduction hooks like RTK) before returning data into conversation context.
- Monitor token consumption and expenditure against project budgets; fail-closed before incurring surprise metered billing.
