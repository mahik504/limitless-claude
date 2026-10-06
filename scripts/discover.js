
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const os = require("os");

const dbPath = path.join(os.homedir(), ".omniroute", "storage.sqlite");
const db = new Database(dbPath, { readonly: true });

// Read API Key (grab the latest one)
const apiKeyRow = db.prepare("SELECT key FROM api_keys ORDER BY created_at DESC LIMIT 1").get();
const apiKey = apiKeyRow ? apiKeyRow.key : "";

// Read Providers
const providers = db.prepare("SELECT provider, is_active FROM provider_connections").all();
const providerInventory = providers.map(p => {
  // Categorize
  let status = p.is_active ? "CORE" : "UNUSABLE";
  if (["kiro", "muse-spark-web", "opencode"].includes(p.provider)) {
    status = "QUARANTINED";
  }
  if (["agentrouter", "cerebras", "huggingchat", "qwen-web", "github"].includes(p.provider)) {
    status = p.is_active ? "USEFUL" : "UNUSABLE";
  }

  return {
    provider: p.provider,
    connected: true,
    active: p.is_active === 1,
    authentication_state: p.is_active === 1 ? "Valid" : "Unknown",
    models_available: 0,
    free_or_paid: p.provider === "openrouter" ? "Mixed" : "Free", 
    quota_class: p.provider === "openrouter" ? "Paid" : "Rate-Limited Uncapped",
    tool_support: true,
    status,
    last_verified: new Date().toISOString(),
    notes: ""
  };
});

fs.writeFileSync("config/provider-inventory.json", JSON.stringify(providerInventory, null, 2));
console.log("Wrote provider-inventory.json");

// Read Live Models
async function fetchModels() {
  const res = await fetch("http://127.0.0.1:20128/v1/models", {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  const data = await res.json();
  
  if (!data.data) {
    console.error("Failed to fetch models:", data);
    return;
  }
  
  const modelInventory = data.data
    .filter(m => m.id.includes("/"))
    .map(m => {
      const parts = m.id.split("/");
      const provider = parts.shift();
      const modelName = parts.join("/");
      
      let billing = "free";
      if (provider === "openrouter" && !modelName.includes(":free")) billing = "paid";
      if (provider === "github" || provider === "antigravity") billing = "subscription";

      return {
        id: m.id,
        provider,
        model: modelName,
        billing,
        context: m.context_length || 128000,
        tools: m.capabilities?.tool_calling || false,
        reasoning: m.capabilities?.reasoning || false,
        vision: m.capabilities?.vision || (m.input_modalities && m.input_modalities.includes("image")),
        latency_data: "unknown",
        pricing: "unknown",
        quota: billing === "free" ? "Rate-limited" : "Budget-based",
        timestamp: new Date().toISOString()
      };
    });
    
  fs.writeFileSync("config/model-inventory.json", JSON.stringify(modelInventory, null, 2));
  console.log("Wrote model-inventory.json");
}

fetchModels().catch(console.error);

