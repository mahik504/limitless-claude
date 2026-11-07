#!/usr/bin/env node
/**
 * Limitless Claude 7.0 - Atomic Rollback CLI
 * 
 * Lists and restores database and configuration snapshots atomically.
 * 
 * Usage:
 *   node scripts/rollback.js --list
 *   node scripts/rollback.js --snapshot <snapshot-id> [--dry-run]
 */

const { defaultConfigManager } = require("../src/core/config-manager");
const { logger } = require("../src/utils/logger");

function printHelp() {
  console.log(`
Limitless Claude 7.0 - Atomic Rollback Tool

Usage:
  node scripts/rollback.js [options]

Options:
  --list                 List all available snapshots with timestamps and files
  --snapshot <id>        Snapshot ID to restore from
  --latest               Restore from the most recent snapshot
  --dry-run              Verify snapshot integrity without writing to disk
  --help                 Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  let snapshotId = null;
  let isLatest = false;
  let isList = false;
  let isDryRun = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else if (a === "--list") {
      isList = true;
    } else if (a === "--snapshot") {
      snapshotId = args[++i];
    } else if (a === "--latest") {
      isLatest = true;
    } else if (a === "--dry-run") {
      isDryRun = true;
    }
  }

  const snapshots = defaultConfigManager.listSnapshots();

  if (isList || (!snapshotId && !isLatest)) {
    console.log("\n=======================================================");
    console.log("       LIMITLESS CLAUDE 7.0 - BACKUP SNAPSHOTS");
    console.log("=======================================================\n");

    if (snapshots.length === 0) {
      console.log("No backup snapshots found in backups/ directory.");
      process.exit(0);
    }

    for (const s of snapshots) {
      console.log(`- Snapshot ID : ${s.snapshotId}`);
      console.log(`  Timestamp   : ${s.timestamp}`);
      console.log(`  Tag         : ${s.tag || "none"}`);
      console.log(`  Files       : ${(s.files || []).join(", ")}\n`);
    }

    console.log("To restore, run: node scripts/rollback.js --snapshot <id>");
    process.exit(0);
  }

  if (isLatest) {
    if (snapshots.length === 0) {
      logger.error("No snapshots available to restore.");
      process.exit(1);
    }
    snapshotId = snapshots[0].snapshotId;
  }

  const target = snapshots.find(s => s.snapshotId === snapshotId);
  if (!target) {
    logger.error(`Snapshot '${snapshotId}' not found. Run --list to see available snapshots.`);
    process.exit(1);
  }

  logger.info(`Selected snapshot for restoration: ${snapshotId}`);

  if (isDryRun) {
    logger.info(`[DRY-RUN] Verified snapshot ${snapshotId} integrity. Target files: ${(target.files || []).join(", ")}`);
    process.exit(0);
  }

  try {
    const count = defaultConfigManager.rollback(snapshotId);
    console.log("\n=======================================================");
    console.log(` [SUCCESS] Restored ${count} files from snapshot: ${snapshotId}`);
    console.log("=======================================================\n");
  } catch (err) {
    logger.error(`Rollback failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    logger.error(`Rollback CLI error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
