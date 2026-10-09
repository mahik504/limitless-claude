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
  
  const omnirouteDir = process.env.OMNIROUTE_DIR || path.join(os.homedir(), ".omniroute");
  const dbPath = path.join(omnirouteDir, "storage.sqlite");
  
  if (!fs.existsSync(dbPath)) {
    console.error("Error: OmniRoute database not found at", dbPath);
    console.error("Please run `omniroute serve` at least once before setting up Limitless Claude.");
    process.exit(1);
  }

  // Backup Database
  try {
    fs.copyFileSync(dbPath, dbPath + ".bak");
    console.log("Backed up database to storage.sqlite.bak");
  } catch (e) {
    console.warn("Warning: Could not backup database:", e.message);
  }

  const db = new Database(dbPath);
  db.pragma("busy_timeout = 8000");

  const apiKeyRow = db.prepare("SELECT key FROM api_keys ORDER BY created_at DESC LIMIT 1").get();
  const apiKey = apiKeyRow ? apiKeyRow.key : "";
  
  let liveModels = [];
  try {
    const res = await fetch("http://127.0.0.1:20128/v1/models", { headers: { "Authorization": `Bearer ${apiKey}` } });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data && data.data && data.data.length > 0) {
      liveModels = data.data;
    }
  } catch (e) {
    console.warn(`\x1b[33m[WARNING] Failed to fetch live models from OmniRoute (${e.message}). Falling back to cached inventory.\x1b[0m`);
  }
  
  if (liveModels.length === 0) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/live_models.json"), "utf8"));
      liveModels = data.data || [];
    } catch (e) {
      console.error("Error: Failed to load cached models.");
    }
  }

  // Database Transaction to ensure atomicity
  const applySetup = db.transaction(() => {
    if (apiKey) {
      db.prepare("UPDATE api_keys SET model_access_mode = 'all' WHERE key = ?").run(apiKey);
    }

    // Clean old exact matches
    const delCombos = db.prepare(`DELETE FROM combos WHERE id IN (?, ?, ?, ?)`);
    delCombos.run(COMBO_IDS.opus, COMBO_IDS.sonnet, COMBO_IDS.haiku, COMBO_IDS.fable);

    const delMappings = db.prepare(`DELETE FROM model_combo_mappings WHERE id IN (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    delMappings.run(
      MAPPING_IDS.opus, MAPPING_IDS.sonnet, MAPPING_IDS.haiku, MAPPING_IDS.fable,
      MAPPING_IDS.best, MAPPING_IDS.opusplan, MAPPING_IDS.default, MAPPING_IDS.sonnet1m, MAPPING_IDS.opus1m
    );

    const insertCombo = db.prepare("INSERT INTO combos (id, name, data, system_message, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now')) ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, system_message = excluded.system_message, updated_at = datetime('now')");
    
    // Phase 7: Haiku (Speed)
    const haikuCandidates = [
      { provider: "github", model: "gpt-4o-mini" },
      { provider: "antigravity", model: "gemini-3.1-flash-lite" },
      { provider: "kiro", model: "qwen3-coder-next" },
      { provider: "groq", model: "llama-3.1-8b-instant" },
      { provider: "openrouter", model: "z-ai/glm-5.2:free" },
      { provider: "openrouter", model: "qwen/qwen3.8-27b:free" },
      { provider: "openrouter", model: "nvidia/nemotron-3.5-lightning:free" }
    ].filter(c => findModel(liveModels, c.provider, c.model));
    
    insertCombo.run(COMBO_IDS.haiku, "Limitless Haiku Tier", JSON.stringify({
      name: "Limitless Haiku Tier",
      strategy: "priority",
      description: "Fastest reliable models.",
      models: haikuCandidates
    }), "You are an advanced assistant optimized for rapid syntax lookups and lightning-fast codebase searches. Do not output conversational filler. Execute tool calls instantly. Your priority is absolute speed and precision.");

    // Phase 8: Sonnet (Reasoning)
    const sonnetCandidates = [
      { provider: "antigravity", model: "claude-sonnet-4-6" },
      { provider: "bluesminds", model: "deepseek-reasoner" },
      { provider: "antigravity", model: "claude-opus-4-6-thinking" },
      { provider: "github", model: "gpt-4o-2024-11-20" },
      { provider: "kiro", model: "glm-5" },
      { provider: "huggingchat", model: "CohereLabs/command-a-reasoning-08-2025" }
    ].filter(c => findModel(liveModels, c.provider, c.model));

    insertCombo.run(COMBO_IDS.sonnet, "Limitless Sonnet Tier", JSON.stringify({
      name: "Limitless Sonnet Tier",
      strategy: "priority",
      description: "Best planning / architecture / reasoning",
      models: sonnetCandidates
    }), "You are an advanced architectural model. You excel at chain-of-thought reasoning, medium-effort architectural tasks, and multi-agent development environments. Plan carefully before writing code, and ensure flawless tool execution.");

    // Phase 9: Opus (Coding / Round-Robin)
    const opusCandidates = [
      { provider: "kiro", model: "qwen3-coder-next" },
      { provider: "mistral", model: "codestral-latest" },
      { provider: "kiro", model: "deepseek-3.2" },
      { provider: "openrouter", model: "z-ai/glm-5.2:free" },
      { provider: "openrouter", model: "qwen/qwen3.8-27b:free" },
      { provider: "openrouter", model: "poolside/laguna-s-2.1:free" },
      { provider: "bluesminds", model: "gpt-5.5" },
      { provider: "ollama-cloud", model: "glm-5.3" },
      { provider: "bluesminds", model: "kimi-k3" },
      { provider: "kiro", model: "glm-5" },
      { provider: "openrouter", model: "liquid/lfm-2.5-2.6b:free" },
      { provider: "huggingchat", model: "deepseek-ai/DeepSeek-V4-Pro" },
      { provider: "huggingchat", model: "Qwen/Qwen3.6-27B" },
      { provider: "opencode", model: "deepseek-v4-flash-free" },
      { provider: "opencode", model: "big-pickle" },
      { provider: "muse-spark-web", model: "muse-spark-thinking" },
      { provider: "muse-spark-web", model: "muse-spark" }
    ].filter(c => findModel(liveModels, c.provider, c.model));

    insertCombo.run(COMBO_IDS.opus, "Limitless Opus Tier", JSON.stringify({
      name: "Limitless Opus Tier",
      strategy: "round-robin",
      description: "Largest free coding reservoir (Load-Balanced)",
      models: opusCandidates
    }), "You are a massive reasoning and coding powerhouse. You possess deep knowledge of backend development, frontend design, and multi-agent architectures. You effortlessly handle high-effort tasks and massive refactors. Write flawless, production-ready code.");

    // Phase 13: Fable (God-Mode / Round-Robin)
    const fableCandidates = [
      { provider: "github", model: "gpt-4o-2024-11-20" },
      { provider: "antigravity", model: "claude-opus-4-6-thinking" },
      { provider: "antigravity", model: "gemini-3.1-pro-low" },
      { provider: "openrouter", model: "moonshotai/kimi-k3" },
      { provider: "openrouter", model: "z-ai/glm-5.3" },
      { provider: "openrouter", model: "qwen/qwen-3.8-coder-32b-instruct" }
    ].filter(c => findModel(liveModels, c.provider, c.model));

    insertCombo.run(COMBO_IDS.fable, "Limitless Fable Tier", JSON.stringify({
      name: "Limitless Fable Tier",
      strategy: "round-robin",
      description: "Maximum capability-per-dollar (Load-Balanced)",
      models: fableCandidates
    }), "You are a premium model designed for extreme intelligence and balance. You synthesize massive context windows seamlessly and deploy flawless architectural decisions. Use tools autonomously and authoritatively.");

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

    return { haikuCandidates, sonnetCandidates, opusCandidates, fableCandidates };
  });

  let results;
  try {
    results = applySetup();
  } catch (err) {
    console.error("\x1b[31m[ERROR] Database transaction failed. Rolling back changes.\x1b[0m", err.message);
    process.exit(1);
  }

  // Phase 20: Auto-boot Daemon
  try {
    const isWindows = os.platform() === 'win32';
    if (isWindows) {
      const startupDir = path.join(os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
      if (fs.existsSync(startupDir)) {
        // 1. Clean up old corrupted startup files precisely
        const exactMatches = ["Limitless-OmniRoute-Launcher.vbs"];
        exactMatches.forEach(f => {
          const fp = path.join(startupDir, f);
          if (fs.existsSync(fp)) {
            try { fs.unlinkSync(fp); } catch (e) {}
          }
        });

        // 2. Put the loop BAT file inside the project directory, NOT in Startup
        const batPath = path.join(__dirname, '..', 'omniroute-daemon.bat');
        const pnpmBinPath = path.join(os.homedir(), 'AppData', 'Local', 'pnpm', 'bin', 'omniroute.CMD');
        
        // If the direct pnpm path exists use it, otherwise fallback to npx
        const cmdToRun = fs.existsSync(pnpmBinPath) ? `"${pnpmBinPath}"` : 'npx omniroute';

        const batContent = `@echo off\r\n:loop\r\n${cmdToRun} serve\r\necho OmniRoute crashed. Restarting in 5 seconds...\r\ntimeout /t 5 >nul\r\ngoto loop`;
        fs.writeFileSync(batPath, batContent);
        
        // 3. Put ONLY the VBS wrapper in Startup so it runs silently
        const vbsPath = path.join(startupDir, "Limitless-OmniRoute-Launcher.vbs");
        // Add a 10 second delay so Windows network initializes before omniroute starts
        const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\r\nWScript.Sleep 10000\r\nWshShell.Run """" & "${batPath}" & """", 0, False`;
        fs.writeFileSync(vbsPath, vbsContent);
        
        console.log("Installed invisible OmniRoute auto-recovery daemon to Windows Startup.");
      }
    }
  } catch (e) {
    console.log("Could not install Windows Startup daemon:", e.message);
  }

  db.close();
  console.log("\x1b[36m%s\x1b[0m", "\n=== Limitless Claude Setup Complete! ===");
  console.log(`\x1b[33mHaiku models:\x1b[0m ${results.haikuCandidates.length}`);
  console.log(`\x1b[33mSonnet models:\x1b[0m ${results.sonnetCandidates.length}`);
  console.log(`\x1b[33mOpus models:\x1b[0m ${results.opusCandidates.length}`);
  console.log(`\x1b[33mFable models:\x1b[0m ${results.fableCandidates.length}\n`);
  console.log("You can now run \x1b[1mclaude\x1b[0m in your terminal.");

  // Save tier configuration correctly (Preserving any existing benchmark files untouched)
  fs.writeFileSync("config/tier-configuration.json", JSON.stringify({
    haiku: results.haikuCandidates,
    sonnet: results.sonnetCandidates,
    opus: results.opusCandidates,
    fable: results.fableCandidates
  }, null, 2));
}

runSetup().catch(console.error);
