# Limitless Claude 7.0 - Disaster Recovery & Atomic Rollback Guide

Limitless Claude 7.0 includes an atomic snapshot and rollback engine designed to restore configurations and database state instantly in the event of an error, upstream outage, or experimental drift.

---

## 1. How Snapshots Work

Snapshots are stored in `C:\projects\limitless-claude\backups\<snapshot-id>\` and contain:
1. `storage.sqlite`: Snapshot of the OmniRoute database (combos, mappings, providers, api keys).
2. `claude-settings.json`: Snapshot of `~/.claude/settings.json`.
3. `claude.json`: Snapshot of `~/.claude.json`.
4. `.active-profile`: Active provider profile marker.
5. `manifest.json`: Metadata with timestamp, tag, and file checklist.

---

## 2. Listing Available Snapshots

To list all existing snapshots on disk:
```bash
npm run rollback -- --list
```
Example output:
```
- Snapshot ID : pre-switch-native-2026-11-07T15-20-00-000Z
  Timestamp   : 2026-11-07T15:20:00.000Z
  Tag         : pre-switch-native
  Files       : claude-settings.json, claude.json, storage.sqlite, .active-profile
```

---

## 3. Restoring from a Snapshot

### Restore the Most Recent Snapshot:
```bash
npm run rollback -- --latest
```

### Restore a Specific Snapshot by ID:
```bash
npm run rollback -- --snapshot pre-v7-upgrade-2026-11-07T15-17-26-000Z
```

### Dry Run (Integrity Check without writing):
```bash
npm run rollback -- --snapshot <snapshot-id> --dry-run
```

All restorations verify file integrity before copying, guaranteeing atomic consistency.
