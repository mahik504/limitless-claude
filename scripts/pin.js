#!/usr/bin/env node
/**
 * Limitless Claude 8.1.0 - Task-to-Model Pinning CLI
 *
 * Usage:
 *   node scripts/pin.js --list
 *   node scripts/pin.js --task <name> --model <provider/model>
 *   node scripts/pin.js --remove <name>
 *   node scripts/pin.js --reset
 */

const { defaultTaskPinManager, VALID_TASKS } = require("../src/core/task-pins");

function printHelp() {
  console.log(`
================================================================================
           LIMITLESS CLAUDE 8.5.0 — TASK PINNING MANAGER
================================================================================

Usage:
  limitless pin [options]

Options:
  --list                     List active task-to-model pin overrides
  --task <name>              Task capability profile to pin:
                             (${VALID_TASKS.join(", ")})
  --model <provider/model>   Target model identifier (e.g., kiro/claude-sonnet-4.5)
  --remove <name>            Remove the pin override for a specific task
  --reset                    Clear all task-to-model pin overrides
  --help, -h                 Show this help message

Examples:
  limitless pin --list
  limitless pin --task backend --model kiro/claude-sonnet-4.5
  limitless pin --task fast --model groq/openai/gpt-oss-20b
  limitless pin --remove backend
  limitless pin --reset
================================================================================
`);
}

async function main() {
  const args = process.argv.slice(2);
  let isList = false;
  let isReset = false;
  let targetTask = null;
  let targetModel = null;
  let removeTask = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else if (a === "--list") {
      isList = true;
    } else if (a === "--reset") {
      isReset = true;
    } else if (a === "--task") {
      targetTask = args[++i];
    } else if (a === "--model") {
      targetModel = args[++i];
    } else if (a === "--remove") {
      removeTask = args[++i];
    }
  }

  if (isReset) {
    defaultTaskPinManager.resetPins();
    console.log("\n[SUCCESS] Cleared all task-to-model pins.");
    process.exit(0);
  }

  if (removeTask) {
    const removed = defaultTaskPinManager.removePin(removeTask);
    if (removed) {
      console.log(`\n[SUCCESS] Removed pin for task '${removeTask}'.`);
    } else {
      console.log(`\n[INFO] No pin was active for task '${removeTask}'.`);
    }
    process.exit(0);
  }

  if (targetTask && targetModel) {
    defaultTaskPinManager.setPin(targetTask, targetModel);
    console.log(`\n[SUCCESS] Pinned task '${targetTask}' -> '${targetModel}'.`);
    process.exit(0);
  }

  if (targetTask && !targetModel) {
    const pinned = defaultTaskPinManager.getPin(targetTask);
    if (pinned) {
      console.log(`\nTask '${targetTask}' is currently pinned to '${pinned}'.`);
    } else {
      console.log(`\nTask '${targetTask}' has no pin override active.`);
    }
    process.exit(0);
  }

  // Default: list all active pins
  const pins = defaultTaskPinManager.listPins();
  console.log("\n================================================================================");
  console.log("               LIMITLESS CLAUDE — ACTIVE TASK PIN OVERRIDES");
  console.log("================================================================================\n");

  const keys = Object.keys(pins);
  if (keys.length === 0) {
    console.log("  No active task pin overrides configured.");
    console.log("  Routing follows default capability profile priorities.");
    console.log("\n  To pin a task, run:");
    console.log("    limitless pin --task <task> --model <provider/model>\n");
  } else {
    console.log("  TASK PROFILE         PINNED MODEL TARGET");
    console.log("  -------------------  -----------------------------------------------");
    for (const [t, m] of Object.entries(pins)) {
      console.log(`  ${t.padEnd(20)} ${m}`);
    }
    console.log("\n  To remove a pin, run: limitless pin --remove <task>\n");
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
