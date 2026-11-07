#!/usr/bin/env node
/**
 * Limitless Claude 8.0 - Providers CLI
 * 
 * Inspect and test connected providers:
 *   limitless providers list
 *   limitless providers test
 */

const path = require("path");
const fs = require("fs");
const os = require("os");
const { openDatabase } = require("../src/omniroute/db");
const { findTargetApiKey } = require("../src/omniroute/permissions");
const { defaultClassifier } = require("../src/core/billing-classifier");

const args = process.argv.slice(2);
const isTest = args[0] === "test";

const dbPath = path.join(os.homedir(), ".omniroute", "storage.sqlite");
if (!fs.existsSync(dbPath)) {
  console.log("No OmniRoute database found. Please run `limitless init` or start OmniRoute.");
  process.exit(1);
}

let db;
try {
  db = openDatabase(dbPath, { readonly: true });
} catch (e) {
  console.error("Could not open OmniRoute database:", e.message);
  process.exit(1);
}

const keyRow = findTargetApiKey(db);
const apiKey = keyRow ? keyRow.key : "";
const provRows = db.prepare("SELECT provider, is_active FROM provider_connections").all();

console.log(`
================================================================================
             LIMITLESS CLAUDE CONNECTED PROVIDERS (${provRows.length} Total)
================================================================================
  PROVIDER         STATUS    BILLING TAXONOMY         ENTITLEMENT / NOTES
  ---------------  --------  -----------------------  --------------------------
`);

for (const p of provRows) {
  const provName = p.provider.padEnd(16).slice(0, 16);
  const status = p.is_active === 1 ? "ACTIVE  " : "INACTIVE";
  const billingClass = defaultClassifier.classify(p.provider, "default").padEnd(24).slice(0, 24);
  const notes = p.is_active === 1 ? "Connected & available" : "Disabled in OmniRoute";
  console.log(`  ${provName} ${status}  ${billingClass} ${notes}`);
}

console.log("================================================================================");

if (isTest) {
  console.log("\nTesting live ping connectivity through OmniRoute gateway (:20128)...");
  const baseUrl = process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128";
  
  (async () => {
    try {
      const t0 = Date.now();
      const res = await fetch(`${baseUrl}/v1/models`, {
        headers: apiKey ? { "Authorization": `Bearer ${apiKey}` } : {},
        signal: AbortSignal.timeout(4000)
      });
      const latency = Date.now() - t0;
      if (res.ok) {
        console.log(`[PASS] OmniRoute Gateway responds in ${latency}ms (HTTP ${res.status})`);
      } else {
        console.log(`[WARN] OmniRoute Gateway returned HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`[FAIL] OmniRoute Gateway connectivity error: ${e.message}`);
    }
    db.close();
  })();
} else {
  db.close();
}
