const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const os = require("os");

const dbPath = path.join(os.homedir(), ".omniroute", "storage.sqlite");
const configDir = process.env.LIMITLESS_CONFIG_DIR || path.join(__dirname, "../config");

let db;
try {
  db = new Database(dbPath, { readonly: true });
} catch (e) {
  console.error("[ERROR] Could not open OmniRoute database:", e.message);
  process.exit(1);
}

// Read API Key (grab the latest one)
let apiKey = "";
try {
  const apiKeyRow = db.prepare("SELECT key FROM api_keys ORDER BY created_at DESC LIMIT 1").get();
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
    last_verified: new Date().toISOString(),
    notes: "Metadata inferred from local database row. Needs runtime verification."
  };
});

fs.writeFileSync(path.join(configDir, "provider-inventory.json"), JSON.stringify(providerInventory, null, 2));
console.log("Wrote provider-inventory.json");

// Read Live Models
async function fetchModels() {
  if (!apiKey) {
    console.error("[ERROR] No API key found in OmniRoute database.");
    return;
  }

  let res;
  try {
    res = await fetch("http://127.0.0.1:20128/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
  } catch (e) {
    console.error("[ERROR] HTTP request to OmniRoute failed:", e.message);
    return;
  }

  if (!res.ok) {
    console.error(`[ERROR] OmniRoute returned HTTP ${res.status}`);
    return;
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("[ERROR] Failed to parse JSON response from OmniRoute:", e.message);
    return;
  }
  
  if (!data || !data.data || !Array.isArray(data.data)) {
    console.error("[ERROR] Invalid response format from OmniRoute: missing data array.");
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
        timestamp: new Date().toISOString()
      };
    });
    
  fs.writeFileSync(path.join(configDir, "model-inventory.json"), JSON.stringify(modelInventory, null, 2));
  console.log("Wrote model-inventory.json");
}

fetchModels().catch(e => console.error("[ERROR] Unhandled exception:", e.message));
