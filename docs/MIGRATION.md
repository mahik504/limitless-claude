# Limitless Claude - Version 6.1 to 7.0 Migration Guide

This guide details the upgrade path from Limitless Claude 6.1 to 7.0, explaining architectural changes, new commands, and how existing installations are safely preserved.

---

## 1. What Changed in Version 7.0

| Feature | Version 6.1 | Version 7.0 |
| :--- | :--- | :--- |
| **Profile Management** | Single monolithic configuration | 6 distinct profiles (`limitless`, `native`, `opencode-go`, `opencode-zen`, `openrouter`, `antigravity`) |
| **Deprecation Safeguards** | Static model candidate lists | Active Fallback Engine detects upstream deprecation strings (HTTP 200) |
| **Fault Tolerance** | Basic round-robin fallback | Dynamic Circuit Breakers with Half-Open probing and Exponential Backoff |
| **Billing & Quota** | Basic suffix heuristic | Granular 6-tier Billing Classifier with cost estimation & free-only guard |
| **Environment Safety** | Modifies Windows user registry | Scoped process launcher (`npm run launcher`) avoids global pollution |
| **Observability** | Static log files | Real-time terminal dashboard (`npm run dashboard`) with secret redaction |
| **Disaster Recovery** | Single `.bak` copy | Timestamped manifest snapshots & atomic rollback (`npm run rollback`) |
| **Benchmarking** | Manual spot-checks | 12-task automated capability benchmark suite (`npm run benchmark`) |

---

## 2. Safe Migration Steps

### Step 1: Pre-Upgrade Verification
Ensure current tests pass:
```bash
npm test
```

### Step 2: Create a Baseline Snapshot
Before modifying any configuration:
```bash
node -e "const { defaultConfigManager } = require('./src/core/config-manager'); defaultConfigManager.createSnapshot('pre-v7-upgrade');"
```

### Step 3: Run Setup
Execute the Limitless Claude 7.0 setup script to configure combos with verified healthy models and provider-neutral system instructions:
```bash
npm run setup
```

### Step 4: Verify Health & Diagnostics
Check the status of your OmniRoute gateway and combos:
```bash
npm run dashboard
npm run verify
```

### Step 5: Test Client Execution
Launch a test session:
```bash
npm run launcher -- --print "Verify Limitless Claude 7.0 connection"
```
