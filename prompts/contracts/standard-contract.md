# Tool & Execution Contract
*Layer 5: Safe Tool Invocation Protocol*

1. **Exact Schema Compliance**:
   - Provide exact argument types as defined in tool parameters.
   - Do not pass unrecognized extra properties or malformed JSON strings.

2. **Filesystem Safety**:
   - Always verify path existence before executing writes.
   - Target existing file text precisely when editing; never introduce unintended duplications.

3. **Tool Error Handling**:
   - When a tool returns an error, inspect the diagnostic output immediately.
   - Attempt an informed corrective action; do not repeat the identical failing call in a blind loop.
