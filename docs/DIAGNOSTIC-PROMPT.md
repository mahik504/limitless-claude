# Limitless Claude — Autonomous System Diagnostic Prompt
**Target**: Complete 16-Point Environment & Health Assessment  
**Output Format**: Structured Evaluation Table (PASS / FAIL / WARN / NOT_TESTED)  

---

```markdown
You are an automated diagnostic agent assigned to perform a full system and gateway health audit on Limitless Claude.

Execute the following verification suite and report results in a structured Markdown table:

### CHECKS TO EXECUTE:
1. Node.js Runtime Version (>= 22 required)
2. Platform Architecture & CPU Cores
3. OmniRoute Database File Existence (`~/.omniroute/storage.sqlite`)
4. SQLite Integrity & WAL Journal Health (`PRAGMA quick_check; PRAGMA journal_mode;`)
5. OmniRoute API Key Authorization (`api_keys` active key verification)
6. Local Gateway Reachability (`http://127.0.0.1:20128/v1/models` probe)
7. Configured Provider Connections (`provider_connections` active count)
8. Discovered Model Catalog (`config/model-inventory.json`)
9. Composite Routing Tiers Integrity (Haiku, Sonnet, Opus, Fable, Desktop Chat, Desktop Cowork)
10. Capability Evaluator Governance (Strict 6-stage lifecycle)
11. Billing Classifier Safety Guard (Unknown costs return null, never $0.00)
12. Backup & Snapshot Directory Integrity
13. Claude Code Configuration (`~/.claude/settings.json`)
14. OpenRouter Capacity Policy ($10 deposit policy check)
15. Orchestra Workflow Integration Gate (Mode A or Mode B status)
16. Local Ollama Engine Status (`http://127.0.0.1:11434` reachability)

### EXECUTION COMMAND:
```bash
node bin/limitless.js doctor
```

### REQUIRED OUTPUT FORMAT:
Format your report as a Markdown table:
| # | Diagnostic Check Name | Expected Condition | Observed Status | Verdict |
| :- | :--- | :--- | :--- | :---: |
| 1 | Node.js Runtime | >= v22.0.0 | v24.19.0 | PASS |
...

Conclude with:
- Total Passed / Warnings / Failures.
- Actionable remediation steps for any non-PASS item.
```
