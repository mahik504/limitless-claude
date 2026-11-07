#!/usr/bin/env node
/**
 * Limitless Claude 8.1.0 - File-Level Checkpoint & Undo CLI
 *
 * Usage:
 *   limitless undo [--dry-run]
 *   limitless undo --id <checkpoint-id>
 *   limitless checkpoint --create <description> [file1 file2 ...]
 *   limitless checkpoint --list
 */

const path = require("path");
const fs = require("fs");
const { defaultFileCheckpointManager } = require("../src/core/file-checkpoint");

function printHelp() {
  console.log(`
================================================================================
           LIMITLESS CLAUDE 8.1.0 — FILE CHECKPOINT & UNDO CLI
================================================================================

Usage:
  limitless undo [options]
  limitless checkpoint [options]

Undo Commands:
  limitless undo                   Revert all files modified in the latest checkpoint
  limitless undo --dry-run         Preview files that would be restored without writing
  limitless undo --id <id>         Restore files from a specific checkpoint ID

Checkpoint Commands:
  limitless checkpoint --list                      List all captured file checkpoints
  limitless checkpoint --create "desc" [files...]  Snapshot specific files before editing

Examples:
  limitless checkpoint --create "pre-refactor auth" src/auth.js src/db.js
  limitless undo --dry-run
  limitless undo
================================================================================
`);
}

async function main() {
  const args = process.argv.slice(2);
  let isUndo = true;
  let isList = false;
  let isCreate = false;
  let isDryRun = false;
  let targetId = null;
  let createDesc = "Manual snapshot";
  const filesToSnapshot = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else if (a === "--list") {
      isList = true;
      isUndo = false;
    } else if (a === "--dry-run") {
      isDryRun = true;
    } else if (a === "--id") {
      targetId = args[++i];
    } else if (a === "--create") {
      isCreate = true;
      isUndo = false;
      createDesc = args[++i] || "Manual snapshot";
      while (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        filesToSnapshot.push(args[++i]);
      }
    }
  }

  if (isList) {
    const list = defaultFileCheckpointManager.listCheckpoints();
    console.log("\n================================================================================");
    console.log("            LIMITLESS CLAUDE — FILE-LEVEL CHECKPOINTS");
    console.log("================================================================================\n");

    if (list.length === 0) {
      console.log("  No file checkpoints found in .limitless/checkpoints/.");
      console.log("\n  To snapshot files before edits, run:");
      console.log("    limitless checkpoint --create \"description\" <file1> <file2>\n");
      process.exit(0);
    }

    for (const c of list) {
      console.log(`- ID          : ${c.id}`);
      console.log(`  Timestamp   : ${c.timestamp}`);
      console.log(`  Description : ${c.description}`);
      console.log(`  Files (${c.filesCount}) : ${c.files.map(f => f.relativePath).join(", ")}\n`);
    }
    console.log("To restore a specific checkpoint, run: limitless undo --id <id>");
    console.log("To restore the most recent checkpoint, run: limitless undo\n");
    process.exit(0);
  }

  if (isCreate) {
    if (filesToSnapshot.length === 0) {
      console.error("[ERROR] Please provide at least one file path to snapshot.");
      process.exit(1);
    }

    try {
      const manifest = defaultFileCheckpointManager.createCheckpoint(createDesc, filesToSnapshot);
      console.log("\n================================================================================");
      console.log(` [SUCCESS] Checkpoint created: ${manifest.id}`);
      console.log(` Description : "${manifest.description}"`);
      console.log(` Files (${manifest.filesCount}) : ${manifest.files.map(f => f.relativePath).join(", ")}`);
      console.log("================================================================================\n");
      process.exit(0);
    } catch (err) {
      console.error(`[ERROR] Checkpoint creation failed: ${err.message}`);
      process.exit(1);
    }
  }

  // Default: perform undo
  try {
    const result = targetId
      ? defaultFileCheckpointManager.restoreCheckpoint(targetId, { dryRun: isDryRun })
      : defaultFileCheckpointManager.undoLast({ dryRun: isDryRun });

    console.log("\n================================================================================");
    if (isDryRun) {
      console.log(` [DRY-RUN] Verified checkpoint restore: ${result.checkpointId}`);
      console.log(` Files to revert (${result.restoredFiles.length}):`);
      for (const f of result.restoredFiles) {
        console.log(`   - ${f}`);
      }
    } else {
      console.log(` [SUCCESS] Restored ${result.restoredFiles.length} files from checkpoint: ${result.checkpointId}`);
      for (const f of result.restoredFiles) {
        console.log(`   ✔ Restored: ${f}`);
      }
    }
    console.log("================================================================================\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n[ERROR] Undo failed: ${err.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
