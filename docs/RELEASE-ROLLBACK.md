# Limitless Claude 7.0.0 — Disaster Recovery & Rollback Plan

This document specifies the exact rollback procedures to restore Limitless Claude to previous versions or to recover from corrupted state, upstream provider failures, or accidental configuration changes.

---

## 1. Automated Atomic Rollback (Recommended)

Limitless Claude 7.0.0 includes an integrated rollback CLI ([`scripts/rollback.js`](file:///C:/projects/limitless-claude/scripts/rollback.js)):

### List Available Snapshots
```powershell
node scripts/rollback.js --list
```
Output lists all timestamped backups stored in `backups/<snapshot-id>/` along with their file manifests.

### Dry-Run Integrity Verification
Before restoring, verify that the snapshot is intact and uncorrupted:
```powershell
node scripts/rollback.js --snapshot <snapshot-id> --dry-run
```

### Restore to Most Recent Snapshot
```powershell
node scripts/rollback.js --latest
```

### Restore to a Specific Named Snapshot
```powershell
node scripts/rollback.js --snapshot pre-v7-migration-2026-11-07T15-17-26-000Z
```

---

## 2. Manual Emergency Recovery

If the Node.js runtime or CLI scripts are inaccessible, manual recovery can be performed directly from disk:

### Step 1: Stop OmniRoute Daemon
```powershell
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
```

### Step 2: Restore Database
```powershell
Copy-Item "C:\projects\limitless-claude\backups\storage.sqlite-20261107-151726.bak" "$env:USERPROFILE\.omniroute\storage.sqlite" -Force
```

### Step 3: Restore Claude Settings
```powershell
Copy-Item "C:\projects\limitless-claude\backups\claude-settings-20261107-151726.json.bak" "$env:USERPROFILE\.claude\settings.json" -Force
Copy-Item "C:\projects\limitless-claude\backups\claude-20261107-151726.json.bak" "$env:USERPROFILE\.claude.json" -Force
```

### Step 4: Restart OmniRoute Daemon
```powershell
npx omniroute serve
```

---

## 3. Restoring Native Claude Code Environment

To temporarily or permanently disconnect Limitless Claude and communicate directly with Anthropic's official servers:
```powershell
node scripts/switch-profile.js native
```
This removes `ANTHROPIC_BASE_URL` from `~/.claude/settings.json`, allowing Claude Code to read official Anthropic credentials directly.
