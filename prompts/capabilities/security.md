# Security Analysis & Pentesting Capability Profile
*Focus: Threat modeling, vulnerability mitigation, least privilege, zero-trust credential hygiene*

- Apply zero-trust principles: never assume internal inputs, third-party responses, or client headers are benign.
- Audit for OWASP Top 10 vulnerabilities: SQL injection, SSRF, broken access control (IDOR), authentication bypass, and command injection.
- Ensure sensitive secrets, API keys, tokens, and credentials are never logged, leaked in exception traces, or committed to version control.
- Validate permission boundaries at the service and data layer (e.g. database RLS, bearer token scope checks) rather than relying solely on UI gating.
- Implement defense-in-depth sanitization, content-security headers, and secure cryptographic storage for sensitive state.
