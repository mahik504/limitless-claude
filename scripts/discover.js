const path = require("path");
const fs = require("fs");
const os = require("os");
const { openDatabase } = require("../src/omniroute/db");
const { findTargetApiKey } = require("../src/omniroute/permissions");

const cliArgs = process.argv.slice(2);
if (cliArgs.includes("--help") || cliArgs.includes("-h")) {
  console.log(`Limitless Claude Model & Provider Discovery CLI

Usage:
  node scripts/discover.js [options]

Options:
  --help, -h                     Show this help message.
`);
  process.exit(0);
}

const omnirouteDir = process.env.OMNIROUTE_DIR || path.join(os.homedir(), ".omniroute");
const dbPath = path.join(omnirouteDir, "storage.sqlite");
const configDir = process.env.LIMITLESS_CONFIG_DIR || path.join(__dirname, "../config");

if (!fs.existsSync(dbPath)) {
  console.error("[ERROR] OmniRoute database not found at:", dbPath);
  console.error("Please run `omniroute serve` before discovering models.");
  process.exit(1);
}

let db;
try {
  db = openDatabase(dbPath, { readonly: true });
} catch (e) {
  console.error("[ERROR] Could not open OmniRoute database:", e.message);
  process.exit(1);
}

// Read API Key (prioritizing active / recent)
let apiKey = "";
try {
  const apiKeyRow = findTargetApiKey(db);
  apiKey = apiKeyRow ? apiKeyRow.key : "";
} catch (e) {
  console.error("[ERROR] Could not query api_keys:", e.message);
}

// Read Providers
let providers = [];
try {
  providers = db.prepare("SELECT provider, is_active FROM provider_connections").all();
} catch (e) {
  console.error("[ERROR] Could not query provider_connections:", e.message);
}

const providerInventory = providers.map(p => {
  return {
    provider: p.provider,
    configured: true,
    active: p.is_active === 1,
    authentication_state: "unverified", // Cannot infer auth is valid just from DB flag
    free_or_paid: "unverified",
    quota_class: "unverified",
    tool_support: "unverified",
    last_scanned: new Date().toISOString(),
    notes: "Metadata inferred from local database row. Needs runtime verification."
  };
});

try {
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, "provider-inventory.json"), JSON.stringify(providerInventory, null, 2));
  console.log("Wrote provider-inventory.json");
} catch (e) {
  console.error("[ERROR] Failed to write provider-inventory.json:", e.message);
  process.exitCode = 1;
}

// Read Live Models
async function fetchModels() {
  const warnStaleInventory = () => {
    const existingModelInventory = path.join(configDir, "model-inventory.json");
    if (fs.existsSync(existingModelInventory)) {
      console.warn("[WARNING] Note: Existing model-inventory.json was not updated and is not evidence of a fresh successful scan.");
    }
  };

  if (!apiKey) {
    console.warn("[WARNING] No API key found in OmniRoute database; live model discovery cannot proceed.");
    warnStaleInventory();
    process.exitCode = 1;
    db.close();
    return;
  }

  let res;
  const baseUrl = process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128";
  try {
    res = await fetch(`${baseUrl}/v1/models`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(4000)
    });
  } catch (e) {
    console.warn(`[WARNING] HTTP request to OmniRoute failed (${e.message}). Live models unavailable.`);
    warnStaleInventory();
    process.exitCode = 1;
    db.close();
    return;
  }

  if (!res.ok) {
    console.warn(`[WARNING] OmniRoute returned HTTP ${res.status}. Live model discovery failed.`);
    warnStaleInventory();
    process.exitCode = 1;
    db.close();
    return;
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("[ERROR] Failed to parse JSON response from OmniRoute:", e.message);
    warnStaleInventory();
    process.exitCode = 1;
    db.close();
    return;
  }

  if (!data || !data.data || !Array.isArray(data.data)) {
    console.error("[ERROR] Invalid response format from OmniRoute: missing data array.");
    warnStaleInventory();
    process.exitCode = 1;
    db.close();
    return;
  }

  const modelInventory = data.data
    .filter(m => m.id && m.id.includes("/"))
    .map(m => {
      const parts = m.id.split("/");
      const provider = parts.shift();
      const modelName = parts.join("/");

      let billing = "unverified";
      if (provider === "openrouter" && modelName.includes(":free")) billing = "free";

      return {
        id: m.id,
        provider,
        model: modelName,
        billing,
        context: m.context_length !== undefined ? m.context_length : "unknown",
        tools: m.capabilities?.tool_calling !== undefined ? m.capabilities.tool_calling : "unknown",
        reasoning: m.capabilities?.reasoning !== undefined ? m.capabilities.reasoning : "unknown",
        vision: m.capabilities?.vision !== undefined ? m.capabilities.vision : (m.input_modalities && m.input_modalities.includes("image") ? true : "unknown"),
        latency_data: "unverified",
        pricing: "unverified",
        quota: "unverified",
        last_scanned: new Date().toISOString()
      };
    });

  try {
    fs.writeFileSync(path.join(configDir, "model-inventory.json"), JSON.stringify(modelInventory, null, 2));
    console.log(`Wrote model-inventory.json (${modelInventory.length} models)`);
  } catch (e) {
    console.error("[ERROR] Failed to write model-inventory.json:", e.message);
    process.exitCode = 1;
  }

  db.close();
}

fetchModels().catch(e => {
  console.error("[ERROR] Unhandled exception:", e.message);
  if (db) db.close();
  process.exit(1);
});
