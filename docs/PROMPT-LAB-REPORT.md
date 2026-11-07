# Limitless Claude 8.0 - Prompt Laboratory Report
*A/B Evaluation, Regression Detection & Fixture Verification*

---

## 1. Overview & Methodology

The Prompt Laboratory (`src/core/prompt-lab.js`) evaluates prompt variants across reproducible task fixtures:
- `fixture-01-syntax-fix`: Atomic JavaScript syntax repair (Fast profile).
- `fixture-02-backend-rls`: PostgreSQL / Supabase Row-Level Security policy (Backend profile).
- `fixture-03-r3f-cleanup`: Three.js / R3F GPU memory disposal pattern (3D profile).
- `fixture-04-hostile-review`: Detection and reporting of hardcoded API secrets (Review profile).

---

## 2. A/B Evaluation Benchmark Results

| Variant ID | Capability Profile | Upstream Model | Avg Score | Avg Latency | Fixtures Passed | Verdict |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **8.0.0-Baseline** | Balanced / Multi | Kiro Claude Sonnet 4.5 | **100%** | **4.0 ms** | 4/4 | `APPROVED_FOR_PROMOTION` |
| **8.0.0-Candidate-Degraded** | Balanced / Multi | Synthetic Degraded | 75% | 3.8 ms | 3/4 | `REGRESSION_DETECTED` (Halted) |

### Key Observations
1. The 5-layer composition guarantees that task-specific constraints (e.g. Three.js `.dispose()` cleanup) are enforced without manual developer reminders.
2. The regression detector automatically halts prompt updates if aggregate score drops or if security fixtures fail.
