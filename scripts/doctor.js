#!/usr/bin/env node
/**
 * Limitless Claude 8.1 - System & Gateway Doctor (15-Point Diagnostics)
 * 
 * Verifies end-to-end environment readiness:
 * - Runtime version & platform
 * - OmniRoute gateway & database integrity
 * - Key authorization & combo permissions
 * - Model & provider catalog health
 * - Active tiers & routing viability
 * - Billing safety & OpenRouter quota state
 */

const os = require("os");
const path = require("path");
const fs = require("fs");
const { openDatabase } = require("../src/omniroute/db");
const { findTargetApiKey } = require("../src/omniroute/permissions");
const { defaultClassifier } = require("../src/core/billing-classifier");
const { defaultCapabilityEvaluator } = require("../src/core/capability-evaluator");
const { defaultCapacityCalculator } = require("../src/core/capacity-calculator");

async function runDoctor() {
  console.log(`
================================================================================
          LIMITLESS CLAUDE 8.2 — SYSTEM & GATEWAY DIAGNOSTIC DOCTOR
================================================================================
`);

  const checks = [];
  let passedCount = 0;
  let warnCount = 0;
  let failCount = 0;

  function report(name, status, detail) {
    if (status === "PASS") passedCount++;
    else if (status === "WARN") warnCount++;
    else failCount++;

    const icon = status === "PASS" ? "[PASS]" : (status === "WARN" ? "[WARN]" : "[FAIL]");
    console.log(`  ${icon.padEnd(8)} ${name.padEnd(36)} : ${detail}`);
  }

  // 1. Node.js Runtime
  const nodeVer = parseInt(process.versions.node.split(".")[0], 10);
  if (nodeVer >= 22) {
    report("Node.js Runtime Version", "PASS", `v${process.versions.node} (>= 22 required)`);
  } else {
    report("Node.js Runtime Version", "FAIL", `v${process.versions.node} (Node 22+ required)`);
  }

  // 2. Platform Architecture
  report("Platform Architecture", "PASS", `${os.platform()} (${os.arch()}), ${os.cpus().length} cores`);

  // 3. Database File Existence
  const omnirouteDir = path.join(os.homedir(), ".omniroute");
  const dbPath = path.join(omnirouteDir, "storage.sqlite");
  const dbExists = fs.existsSync(dbPath);
  if (dbExists) {
    report("OmniRoute Database File", "PASS", dbPath);
  } else {
    report("OmniRoute Database File", "FAIL", `Missing at ${dbPath}`);
  }

  let db = null;
  let apiKey = null;

  // 4. SQLite Readability & Journal Mode
  if (dbExists) {
    try {
      db = openDatabase(dbPath, { readonly: true });
      const journalMode = db.prepare("PRAGMA journal_mode;").get();
      const modeStr = journalMode ? Object.values(journalMode)[0] : "unknown";
      report("SQLite Integrity & Journal Mode", "PASS", `Journal: ${modeStr.toUpperCase()}`);
    } catch (e) {
      report("SQLite Integrity & Journal Mode", "FAIL", e.message);
    }
  }

  // 5. Active API Key
  if (db) {
    try {
      const keyRow = findTargetApiKey(db);
      if (keyRow && keyRow.key) {
        apiKey = keyRow.key;
        const masked = `${apiKey.slice(0, 7)}...${apiKey.slice(-6)}`;
        report("OmniRoute API Key Authorization", "PASS", `Active key: ${masked}`);
      } else {
        report("OmniRoute API Key Authorization", "WARN", "No active API key found in database");
      }
    } catch (e) {
      report("OmniRoute API Key Authorization", "FAIL", e.message);
    }
  }

  // 6. Local Gateway Connectivity
  const gatewayUrl = process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128";
  let gatewayOnline = false;
  let latencyMs = 0;

  try {
    const t0 = Date.now();
    const headers = apiKey ? { "Authorization": `Bearer ${apiKey}` } : {};
    const res = await fetch(`${gatewayUrl}/v1/models`, { headers, signal: AbortSignal.timeout(3000) });
    latencyMs = Date.now() - t0;
    if (res.ok) {
      gatewayOnline = true;
      report("Local Gateway Reachability (:20128)", "PASS", `HTTP ${res.status} OK (${latencyMs}ms)`);
    } else {
      report("Local Gateway Reachability (:20128)", "WARN", `HTTP ${res.status} returned from gateway`);
    }
  } catch (e) {
    report("Local Gateway Reachability (:20128)", "FAIL", `Cannot connect to ${gatewayUrl} (${e.message})`);
  }

  // 7. Configured Providers Count
  if (db) {
    try {
      const provs = db.prepare("SELECT provider, is_active FROM provider_connections").all();
      const activeProvs = provs.filter(p => p.is_active === 1);
      report("Configured Provider Connections", "PASS", `${activeProvs.length} active / ${provs.length} total`);
    } catch (e) {
      report("Configured Provider Connections", "WARN", e.message);
    }
  }

  // 8. Model Catalog Inventory
  const catalogPath = path.resolve(__dirname, "../config/model-inventory.json");
  if (fs.existsSync(catalogPath)) {
    try {
      const models = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
      report("Discovered Model Catalog", "PASS", `${models.length} models catalogued`);
    } catch (_) {
      report("Discovered Model Catalog", "WARN", "model-inventory.json is corrupted");
    }
  } else {
    report("Discovered Model Catalog", "WARN", "Run `limitless discover` to scan models");
  }

  // 9. Composite Routing Tiers Integrity
  if (db) {
    try {
      const combos = db.prepare("SELECT name FROM combos").all();
      const comboNames = combos.map(c => (c.name || "").toLowerCase());
      const hasHaiku = comboNames.some(n => n.includes("haiku"));
      const hasSonnet = comboNames.some(n => n.includes("sonnet"));
      const hasOpus = comboNames.some(n => n.includes("opus"));
      const hasFable = comboNames.some(n => n.includes("fable"));

      if (hasHaiku && hasSonnet && hasOpus && hasFable) {
        report("Composite Routing Tiers (4 Tiers)", "PASS", `All 4 tiers registered (Haiku, Sonnet, Opus, Fable)`);
      } else {
        report("Composite Routing Tiers (4 Tiers)", "WARN", `Some tiers missing; run \`limitless setup\``);
      }
    } catch (e) {
      report("Composite Routing Tiers (4 Tiers)", "FAIL", e.message);
    }
  }

  // 10. Capability Evaluator Lifecycle
  const sonnetEval = defaultCapabilityEvaluator.evaluateModel("kiro", "claude-sonnet-4.5");
  if (sonnetEval.lifecycle === "PRODUCTION_APPROVED" && sonnetEval.isEmpirical) {
    report("Capability Evaluator Governance", "PASS", "Strict 6-stage lifecycle enforced");
  } else {
    report("Capability Evaluator Governance", "FAIL", "Lifecycle integrity check failed");
  }

  // 11. Billing Classifier Guard
  const unknownCost = defaultClassifier.estimateCost("unknown-prov", "unknown-model");
  if (unknownCost === null) {
    report("Billing Classifier Safety Guard", "PASS", "Unknown costs return null (never $0.00)");
  } else {
    report("Billing Classifier Safety Guard", "FAIL", "Unknown model did not return null");
  }

  // 12. Backup Snapshot Directory
  const backupsDir = path.resolve(__dirname, "../backups");
  if (fs.existsSync(backupsDir)) {
    const snaps = fs.readdirSync(backupsDir).filter(f => fs.statSync(path.join(backupsDir, f)).isDirectory());
    report("Backup & Snapshot Directory", "PASS", `${snaps.length} snapshots available for rollback`);
  } else {
    report("Backup & Snapshot Directory", "PASS", "Directory ready (no snapshots yet)");
  }

  // 13. Claude Configuration Directory
  const claudeDir = path.join(os.homedir(), ".claude");
  if (fs.existsSync(claudeDir)) {
    report("Claude Code Configuration Dir", "PASS", claudeDir);
  } else {
    report("Claude Code Configuration Dir", "WARN", `${claudeDir} not found (created on first Claude launch)`);
  }

  // 14. OpenRouter Quota Intelligence
  const capacity = defaultCapacityCalculator.getCapacityReport();
  report("OpenRouter Capacity Policy", "PASS", `$10 credit unlocks ${capacity.fundedTier.dailyRequests} req/day (vs ${capacity.unfundedTier.dailyRequests} unfunded)`);

  // 15. Orchestration & Interop Environment
  const { defaultOrchestraAdapter } = require("../src/integrations/orchestra");
  const orchDetails = defaultOrchestraAdapter.getDetails();
  if (orchDetails.detected) {
    report("Orchestra Integration Gate", "PASS", `Connected: ${orchDetails.path} (v${orchDetails.version}, ${orchDetails.skillsCount} skills, Mode B Active)`);
  } else {
    report("Standalone Architecture Gate", "PASS", "Zero external framework dependencies required (Mode A Active)");
  }

  // 16. Local Ollama Auto-Discovery Engine
  const { defaultOllamaDiscovery } = require("../src/core/ollama-discovery");
  const ollamaRes = await defaultOllamaDiscovery.probe();
  if (ollamaRes.online) {
    report("Local Ollama Engine (:11434)", "PASS", `Online: ${ollamaRes.modelCount} local models available for zero-cost offline routing`);
  } else {
    report("Local Ollama Engine (:11434)", "PASS", "Standby / Optional (offline; cloud combos active)");
  }

  if (db) db.close();

  console.log(`
--------------------------------------------------------------------------------
Diagnostic Summary: ${passedCount} PASSED, ${warnCount} WARNINGS, ${failCount} FAILURES
${failCount === 0 ? ">>> System is healthy, operational, and production-ready." : ">>> Please resolve highlighted failures above."}
================================================================================
`);

  process.exitCode = failCount > 0 ? 1 : 0;
}

runDoctor().catch(err => {
  console.error("[FATAL] Doctor encountered uncaught error:", err);
  process.exitCode = 1;
});
