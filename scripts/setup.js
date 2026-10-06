const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const os = require("os");

const COMBO_IDS = {
  opus: "combo/limitless-opus",
  sonnet: "combo/limitless-sonnet",
  haiku: "combo/limitless-haiku",
  fable: "combo/limitless-fable"
};

const MAPPING_IDS = {
  opus: "mapping/limitless-opus",
  sonnet: "mapping/limitless-sonnet",
  haiku: "mapping/limitless-haiku",
  fable: "mapping/limitless-fable",
  best: "mapping/limitless-best",
  opusplan: "mapping/limitless-opusplan",
  default: "mapping/limitless-default",
  sonnet1m: "mapping/limitless-sonnet1m",
  opus1m: "mapping/limitless-opus1m"
};

function findModel(liveModels, provider, modelName) {
  return liveModels.find(m => m.id === `${provider}/${modelName}`);
}

async function runSetup() {
  console.log("Restoring Limitless Claude Architecture...");
  
  const dbPath = path.join(os.homedir(), ".omniroute", "storage.sqlite");
  const db = new Database(dbPath);
  db.pragma("busy_timeout = 8000");

  const apiKeyRow = db.prepare("SELECT key FROM api_keys ORDER BY created_at DESC LIMIT 1").get();
  const apiKey = apiKeyRow ? apiKeyRow.key : "";
  if (apiKey) {
    db.prepare("UPDATE api_keys SET model_access_mode = 'all' WHERE key = ?").run(apiKey);
  }
  
  let liveModels = [];
  try {
    const res = await fetch("http://127.0.0.1:20128/v1/models", { headers: { "Authorization": `Bearer ${apiKey}` } });
    const data = await res.json();
    if (data && data.data && data.data.length > 0) liveModels = data.data;
  } catch (e) {}
  
  if (liveModels.length === 0) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/live_models.json"), "utf8"));
      liveModels = data.data || [];
    } catch (e) {}
  }
  
  // Clean old
  db.prepare("DELETE FROM combos WHERE id LIKE '%limitless%'").run();
  db.prepare("DELETE FROM model_combo_mappings WHERE id LIKE '%limitless%'").run();

  const insertCombo = db.prepare("INSERT INTO combos (id, name, data, system_message, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now')) ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, system_message = excluded.system_message, updated_at = datetime('now')");
  
  // Phase 7: Haiku
  const haikuCandidates = [
    { provider: "openrouter", model: "nvidia/nemotron-3.5-lightning:free" },
    { provider: "openrouter", model: "google/gemini-2.0-flash-exp:free" },
    { provider: "github", model: "gemini-3.7-flash" },
    { provider: "antigravity", model: "gemini-3.8-flash-low" },
    { provider: "huggingchat", model: "deepseek-ai/DeepSeek-V4-Flash" },
    { provider: "antigravity", model: "gemini-3.1-flash-lite" },
    { provider: "groq", model: "llama-3.1-8b-instant" }
  ].filter(c => findModel(liveModels, c.provider, c.model));
  
  insertCombo.run(COMBO_IDS.haiku, "Limitless Haiku Tier", JSON.stringify({
    name: "Limitless Haiku Tier",
    strategy: "priority",
    description: "Fastest reliable models.",
    models: haikuCandidates
  }), "");

  // Phase 8: Sonnet
  const sonnetCandidates = [
    { provider: "github", model: "gpt-4o-2024-11-20" },
    { provider: "antigravity", model: "claude-opus-4-6-thinking" },
    { provider: "huggingchat", model: "CohereLabs/command-a-reasoning-08-2025" },
    { provider: "antigravity", model: "claude-sonnet-4-6" },
    { provider: "cloudflare-ai", model: "@cf/qwen/qwq-32b" },
    { provider: "bluesminds", model: "deepseek-reasoner" }
  ].filter(c => findModel(liveModels, c.provider, c.model));

  insertCombo.run(COMBO_IDS.sonnet, "Limitless Sonnet Tier", JSON.stringify({
    name: "Limitless Sonnet Tier",
    strategy: "priority",
    description: "Best planning / architecture / reasoning",
    models: sonnetCandidates
  }), "");

  // Phase 9: Opus
  const opusCandidates = [
    { provider: "openrouter", model: "qwen/qwen3.8-27b:free" },
    { provider: "openrouter", model: "z-ai/glm-5.2:free" },
    { provider: "openrouter", model: "poolside/laguna-s-2.1:free" },
    { provider: "openrouter", model: "cohere/north-mini-code:free" },
    { provider: "openrouter", model: "liquid/lfm-2.5-2.6b:free" },
    { provider: "mistral", model: "codestral-latest" },
    { provider: "huggingchat", model: "deepseek-ai/DeepSeek-V4-Pro" },
    { provider: "huggingchat", model: "moonshotai/Kimi-K2.7-Code" },
    { provider: "huggingchat", model: "openai/gpt-oss-120b" },
    { provider: "huggingchat", model: "Qwen/Qwen3.6-27B" },
    { provider: "bluesminds", model: "gpt-5.5" },
    { provider: "bluesminds", model: "kimi-k3" },
    { provider: "muse-spark-web", model: "muse-spark-thinking" },
    { provider: "muse-spark-web", model: "muse-spark" },
    { provider: "qwen-web", model: "qwen3.8-max" },
    { provider: "qwen-web", model: "qwen-3-coder" },
    { provider: "kiro", model: "qwen3-coder-next" },
    { provider: "kiro", model: "glm-5" },
    { provider: "kiro", model: "deepseek-3.2" },
    { provider: "kiro", model: "minimax-m2.5" },
    { provider: "ollama-cloud", model: "glm-5.3" },
    { provider: "ollama-cloud", model: "glm-5.2" },
    { provider: "cloudflare-ai", model: "@cf/zai-org/glm-4.7-flash" },
    { provider: "opencode", model: "big-pickle" },
    { provider: "opencode", model: "deepseek-v4-flash-free" }
  ].filter(c => findModel(liveModels, c.provider, c.model));

  insertCombo.run(COMBO_IDS.opus, "Limitless Opus Tier", JSON.stringify({
    name: "Limitless Opus Tier",
    strategy: "priority",
    description: "Largest free coding reservoir",
    models: opusCandidates
  }), "You are Claude, a powerful AI assistant made by Anthropic. The most recent publicly available models are Claude Fable 5.1, Claude Opus 5.5, Claude Sonnet 5, and Claude Haiku 4.5. You are operating via a Limitless Claude routing layer. Adhere strictly to the user's instructions, write flawless production-ready code, format all outputs perfectly, and use tool calls exactly as a native Claude model would. Do not apologize unnecessarily. Execute code and tasks with maximum agentic autonomy.");

  // Phase 13: Fable
  // Note: AgentRouter models were tested and found to be completely fake (returning Mistral AI identity for Opus 5). 
  // Per user request, they have been purged to protect the integrity of the Fable God-Mode tier.
  const fableCandidates = [
    { provider: "github", model: "claude-fable-5" },
    { provider: "github", model: "claude-opus-5" },
    { provider: "github", model: "gpt-4o-2024-11-20" },
    { provider: "openrouter", model: "moonshotai/kimi-k2.7-code" },
    { provider: "openrouter", model: "z-ai/glm-5.3-flash" },
    { provider: "openrouter", model: "openai/o1-preview" },
    { provider: "github", model: "gpt-5.6-sol" },
    { provider: "antigravity", model: "claude-opus-4-6-thinking" },
    { provider: "antigravity", model: "gemini-3.1-pro-low" },
    { provider: "antigravity", model: "gemini-3.8-flash-high" }
  ].filter(c => findModel(liveModels, c.provider, c.model));

  insertCombo.run(COMBO_IDS.fable, "Limitless Fable Tier", JSON.stringify({
    name: "Limitless Fable Tier",
    strategy: "priority",
    description: "Maximum capability-per-dollar",
    models: fableCandidates
  }), "");

  // Mappings
  let hasDescription = false;
  try {
    const cols = db.prepare("PRAGMA table_info(model_combo_mappings)").all();
    hasDescription = cols.some(c => c.name === "description");
  } catch (e) {}

  const insertMapSql = hasDescription ? 
    "INSERT INTO model_combo_mappings (id, pattern, combo_id, priority, enabled, description, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, datetime('now'), datetime('now')) ON CONFLICT(id) DO UPDATE SET pattern = excluded.pattern, combo_id = excluded.combo_id, priority = excluded.priority, enabled = 1, description = excluded.description, updated_at = datetime('now')" :
    "INSERT INTO model_combo_mappings (id, pattern, combo_id, priority, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now')) ON CONFLICT(id) DO UPDATE SET pattern = excluded.pattern, combo_id = excluded.combo_id, priority = excluded.priority, enabled = 1, updated_at = datetime('now')";
  const insertMap = db.prepare(insertMapSql);

  const mapArgs = (id, pat, cid, pri, desc) => hasDescription ? [id, pat, cid, pri, desc] : [id, pat, cid, pri];

  insertMap.run(...mapArgs(MAPPING_IDS.opus, "*opus*", COMBO_IDS.opus, 10, "Opus route"));
  insertMap.run(...mapArgs(MAPPING_IDS.sonnet, "*sonnet*", COMBO_IDS.sonnet, 10, "Sonnet route"));
  insertMap.run(...mapArgs(MAPPING_IDS.haiku, "*haiku*", COMBO_IDS.haiku, 10, "Haiku route"));
  insertMap.run(...mapArgs(MAPPING_IDS.fable, "*fable*", COMBO_IDS.fable, 10, "Fable route"));
  insertMap.run(...mapArgs(MAPPING_IDS.best, "*best*", COMBO_IDS.fable, 9, "Best route (Fable)"));
  insertMap.run(...mapArgs(MAPPING_IDS.opusplan, "*opusplan*", COMBO_IDS.sonnet, 9, "Opusplan route (Sonnet)"));
  insertMap.run(...mapArgs(MAPPING_IDS.default, "*default*", COMBO_IDS.opus, 8, "Default route (Opus)"));
  insertMap.run(...mapArgs(MAPPING_IDS.sonnet1m, "*sonnet[1m]*", COMBO_IDS.sonnet, 11, "Sonnet 1M context"));
  insertMap.run(...mapArgs(MAPPING_IDS.opus1m, "*opus[1m]*", COMBO_IDS.opus, 11, "Opus 1M context"));

  // Phase 19: API Key Restriction
  db.prepare("UPDATE api_keys SET model_access_mode = 'all', allowed_models = '[]', allowed_combos = '[\"combo/*\"]', catalog_scope = 'all'").run();

  // Phase 20: Auto-boot Daemon
  try {
    const startupDir = path.join(os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
    if (fs.existsSync(startupDir)) {
      const batPath = path.join(startupDir, "omniroute-daemon.bat");
      const vbsPath = path.join(startupDir, "omniroute-limitless.vbs");
      
      let cmdPath = "omniroute";
      if (fs.existsSync(path.join(os.homedir(), ".npm-global", "omniroute.cmd"))) {
          cmdPath = path.join(os.homedir(), ".npm-global", "omniroute.cmd");
      } else if (fs.existsSync(path.join(os.homedir(), "AppData", "Local", "pnpm", "omniroute.cmd"))) {
          cmdPath = path.join(os.homedir(), "AppData", "Local", "pnpm", "omniroute.cmd");
      }
      
      const batContent = `@echo off\r\n:loop\r\n"${cmdPath}" serve\r\necho OmniRoute crashed. Restarting in 5 seconds...\r\ntimeout /t 5 >nul\r\ngoto loop`;
      fs.writeFileSync(batPath, batContent);
      
      const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\r\nWshShell.Run """" & "${batPath}" & """", 0, False`;
      fs.writeFileSync(vbsPath, vbsContent);
      console.log("Installed invisible OmniRoute auto-recovery daemon to Windows Startup.");
    }
  } catch (e) {
    console.log("Could not install Windows Startup daemon:", e.message);
  }

  db.close();
  console.log("Setup complete!");
  console.log("Haiku models:", haikuCandidates.length);
  console.log("Sonnet models:", sonnetCandidates.length);
  console.log("Opus models:", opusCandidates.length);
  console.log("Fable models:", fableCandidates.length);

  fs.writeFileSync("config/benchmark-results.json", JSON.stringify({
    haiku: haikuCandidates,
    sonnet: sonnetCandidates,
    opus: opusCandidates,
    fable: fableCandidates
  }, null, 2));
}

runSetup().catch(console.error);
