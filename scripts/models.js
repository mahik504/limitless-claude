#!/usr/bin/env node
/**
 * Limitless Claude 8.0 - Model Catalog CLI
 * 
 * Inspect and filter catalogued models:
 *   limitless models list [--tier <haiku|sonnet|opus|fable>] [--profile <fast|backend|...>] [--free-only]
 *   limitless models inspect <provider/model>
 */

const path = require("path");
const fs = require("fs");

const catalogPath = path.resolve(__dirname, "../config/model-inventory.json");
if (!fs.existsSync(catalogPath)) {
  console.log("No model inventory found. Please run `limitless discover` first.");
  process.exit(1);
}

const models = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const args = process.argv.slice(2);

const isInspect = args[0] === "inspect";
const isList = args[0] === "list" || !isInspect;

if (isInspect) {
  const targetId = args[1];
  if (!targetId) {
    console.error("Usage: limitless models inspect <provider/model>");
    process.exit(1);
  }
  const match = models.find(m => m.id.toLowerCase() === targetId.toLowerCase());
  if (!match) {
    console.error(`Model not found in catalog: ${targetId}`);
    process.exit(1);
  }
  console.log(`
================================================================================
                    LIMITLESS CLAUDE MODEL INSPECTION
================================================================================
  ID               : ${match.id}
  Provider         : ${match.provider}
  Model            : ${match.model}
  Billing Class    : ${match.billing}
  Lifecycle State  : ${match.lifecycle}
  Is Empirical     : ${match.is_empirical}
  Primary Profiles : ${(match.primary_profiles || []).join(", ")}
  Context Window   : ${match.context} tokens
  Tools Supported  : ${match.tools}
  Reasoning Field  : ${match.reasoning}
  Vision Supported : ${match.vision}
  Pricing State    : ${match.pricing}
  Last Scanned     : ${match.last_scanned}
================================================================================
`);
  process.exit(0);
}

// Listing with filters
let filtered = models;

const freeOnly = args.includes("--free-only");
if (freeOnly) {
  filtered = filtered.filter(m => m.billing === "provider_free_quota" || m.billing === "subscription-entitled" || m.billing === "local");
}

const profileArgIdx = args.indexOf("--profile");
if (profileArgIdx !== -1 && args[profileArgIdx + 1]) {
  const pFilter = args[profileArgIdx + 1].toUpperCase();
  filtered = filtered.filter(m => (m.primary_profiles || []).includes(pFilter));
}

console.log(`
================================================================================
              LIMITLESS CLAUDE MODEL CATALOG (${filtered.length} Models)
================================================================================
  PROVIDER         MODEL                                LIFECYCLE     BILLING
  ---------------  -----------------------------------  ------------  ----------------
`);

for (const m of filtered.slice(0, 40)) {
  const prov = m.provider.padEnd(16).slice(0, 16);
  const mod = m.model.padEnd(36).slice(0, 36);
  const life = String(m.lifecycle || "ESTIMATED").padEnd(13).slice(0, 13);
  const bill = String(m.billing || "unknown").padEnd(16).slice(0, 16);
  console.log(`  ${prov} ${mod} ${life} ${bill}`);
}

if (filtered.length > 40) {
  console.log(`\n  ... and ${filtered.length - 40} more models. Use --profile <name> or --free-only to narrow.`);
}

console.log("================================================================================");
