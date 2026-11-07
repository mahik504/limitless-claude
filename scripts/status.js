#!/usr/bin/env node
/**
 * Limitless Claude 8.0 - Status CLI
 * 
 * Displays instantaneous runtime status overview.
 */

const path = require("path");
const fs = require("fs");
const os = require("os");
const { defaultConfigManager } = require("../src/core/config-manager");
const { openDatabase } = require("../src/omniroute/db");

const activeProfile = defaultConfigManager.getActiveProfile();
const snapshots = defaultConfigManager.listSnapshots();
const latestSnapshot = snapshots.length > 0 ? snapshots[0].snapshotId : "None";

const catalogPath = path.resolve(__dirname, "../config/model-inventory.json");
const modelCount = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, "utf8")).length : 0;

let tiers = [];
const dbPath = path.join(os.homedir(), ".omniroute", "storage.sqlite");
if (fs.existsSync(dbPath)) {
  try {
    const db = openDatabase(dbPath, { readonly: true });
    tiers = db.prepare("SELECT name, data FROM combos").all();
    db.close();
  } catch (_) {}
}

console.log(`
================================================================================
                    LIMITLESS CLAUDE 8.1 RUNTIME STATUS
================================================================================
  Version           : 8.1.0
  Active Profile    : ${activeProfile.toUpperCase()}
  Local Gateway     : http://127.0.0.1:20128
  Catalogued Models : ${modelCount} models
  Latest Snapshot   : ${latestSnapshot}
  Total Snapshots   : ${snapshots.length} available

  ACTIVE ROUTING TIERS (${tiers.length}):
`);

for (const t of tiers) {
  let primary = "None";
  let count = 0;
  try {
    const parsed = JSON.parse(t.data);
    const list = parsed.models || (Array.isArray(parsed) ? parsed : []);
    count = list.length;
    if (list.length > 0) {
      const first = list[0];
      primary = typeof first === "object" ? `${first.provider}/${first.model}` : String(first);
    }
  } catch (_) {}
  console.log(`  - ${t.name.padEnd(28)} -> Primary: ${primary.padEnd(36)} (${count} models)`);
}

console.log(`
================================================================================
`);
