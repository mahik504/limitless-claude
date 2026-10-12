const path = require("path");
const fs = require("fs");
const os = require("os");
const { openDatabase, backupDatabase } = require("../src/omniroute/db");
const { findTargetApiKey, safelyConfigureComboPermissions } = require("../src/omniroute/permissions");

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

function resolvePreferredApiKey() {
  // 1. Explicit env variables
  if (process.env.OMNIROUTE_API_KEY) return process.env.OMNIROUTE_API_KEY.trim();
  if (process.env.ANTHROPIC_AUTH_TOKEN) return process.env.ANTHROPIC_AUTH_TOKEN.trim();
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();

  // 2. Claude Code settings file
  try {
    const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      if (settings.env && settings.env.ANTHROPIC_AUTH_TOKEN) {
        return settings.env.ANTHROPIC_AUTH_TOKEN.trim();
      }
      if (settings.env && settings.env.ANTHROPIC_API_KEY) {
        return settings.env.ANTHROPIC_API_KEY.trim();
      }
      if (settings.ANTHROPIC_API_KEY) {
        return settings.ANTHROPIC_API_KEY.trim();
      }
    }
  } catch (_) {}

  return null;
}

function classifyModelBilling(provider, model) {
  if (!provider || !model) return "unknown";
  const p = String(provider).toLowerCase();
  const m = String(model).toLowerCase();

  // Explicit free model suffix/tag
  if (m.includes(":free") || m.endsWith("-free")) {
    return "zero-marginal-cost";
  }

  // OpenRouter models without :free tag are metered/paid
  if (p === "openrouter") {
    return "paid";
  }

  // Explicitly metered / commercial paid API providers
  if (["mistral", "openai", "anthropic", "together", "fireworks", "cohere", "deepseek", "anyscale", "replicate", "perplexity"].includes(p)) {
    return "paid";
  }

  // Verified developer subscription / quota-entitled endpoints
  if (["github", "antigravity", "bluesminds", "kiro"].includes(p)) {
    return "subscription-entitled";
  }

  // Free community / web interface providers
  if (["groq", "huggingchat", "ollama-cloud", "opencode", "muse-spark-web"].includes(p)) {
    return "zero-marginal-cost";
  }

  return "unknown";
}

function filterCandidatesByBilling(candidates, excludePaid = false, allowUnknown = false) {
  if (!excludePaid) return candidates;
  return candidates.filter(c => {
    const billing = c.billing || classifyModelBilling(c.provider, c.model);
    if (billing === "paid") return false;
    if (billing === "unknown" && !allowUnknown) return false;
    return true;
  });
}

async function runSetup() {
  console.log("Restoring Limitless Claude Architecture...");

  const omnirouteDir = process.env.OMNIROUTE_DIR || path.join(os.homedir(), ".omniroute");
  const dbPath = path.join(omnirouteDir, "storage.sqlite");

  if (!fs.existsSync(dbPath)) {
    console.error("Error: OmniRoute database not found at", dbPath);
    console.error("Please run `omniroute serve` at least once before setting up Limitless Claude.");
    process.exitCode = 1;
    return;
  }

  let db;
  try {
    db = openDatabase(dbPath);
    db.pragma("busy_timeout = 8000");
  } catch (e) {
    console.error("Error: Could not open OmniRoute database:", e.message);
    process.exitCode = 1;
    return;
  }

  // Backup Database using WAL-consistent backup
  const backupPath = dbPath + ".bak";
  try {
    backupDatabase(db, dbPath, backupPath);
    console.log("Backed up database to storage.sqlite.bak (WAL-consistent copy verified)");
  } catch (e) {
    console.error("Error: Could not backup database:", e.message);
    db.close();
    process.exitCode = 1;
    return;
  }

  // Validate expected tables and columns
  try {
    const apiKeysCols = db.prepare("PRAGMA table_info(api_keys)").all();
    if (apiKeysCols.length === 0) throw new Error("Table 'api_keys' does not exist.");
    if (!apiKeysCols.some(c => c.name === 'key')) {
      throw new Error("Missing expected column 'key' in 'api_keys' table.");
    }
    const combosCols = db.prepare("PRAGMA table_info(combos)").all();
    if (combosCols.length === 0) throw new Error("Table 'combos' does not exist.");
    if (!combosCols.some(c => c.name === 'id') || !combosCols.some(c => c.name === 'data')) {
      throw new Error("Missing expected columns 'id' or 'data' in 'combos' table.");
    }
  } catch (e) {
    console.error("Error: Incompatible database schema -", e.message);
    db.close();
    process.exitCode = 1;
    return;
  }

  const configDir = process.env.LIMITLESS_CONFIG_DIR || path.join(__dirname, "../config");

  const preferredKey = resolvePreferredApiKey();
  const apiKeyRow = findTargetApiKey(db, preferredKey);
  const apiKey = apiKeyRow ? apiKeyRow.key : "";

  if (!apiKey) {
    console.warn("\x1b[33m[WARNING] No active OmniRoute API key found.\x1b[0m");
    console.warn("Please ensure you create an API key in the OmniRoute dashboard (http://localhost:20128/keys) or set ANTHROPIC_AUTH_TOKEN before running Claude Code.\n");
  }

  let liveModels = [];
  let isLiveCatalog = false;

  const baseUrl = process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128";

  if (apiKey) {
    try {
      const res = await fetch(`${baseUrl}/v1/models`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
          liveModels = data.data;
          isLiveCatalog = true;
          console.log(`Discovered ${liveModels.length} models from live OmniRoute gateway.`);
        }
      }
    } catch (e) {
      console.warn(`\x1b[33m[WARNING] Failed to fetch live models from OmniRoute (${e.message}). Falling back to cached inventory.\x1b[0m`);
    }
  }

  if (liveModels.length === 0) {
    try {
      let cacheFile = path.join(configDir, "live_models.json");
      if (!fs.existsSync(cacheFile)) {
        cacheFile = path.join(__dirname, "../config/live_models.json");
      }
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        liveModels = data.data || [];
        console.log(`Loaded ${liveModels.length} models from offline cached inventory.`);
      }
    } catch (e) {
      console.error("Error: Failed to load cached models.");
    }
  }

  const mapWithBilling = (candidates) => {
    return candidates.map(c => ({
      provider: c.provider,
      model: c.model,
      billing: classifyModelBilling(c.provider, c.model)
    }));
  };

  // Phase 7: Haiku (Speed)
  const haikuRaw = [
    { provider: "github", model: "gpt-4o-mini" },
    { provider: "antigravity", model: "gemini-3.1-flash-lite" },
    { provider: "kiro", model: "qwen3-coder-next" },
    { provider: "groq", model: "llama-3.1-8b-instant" },
    { provider: "openrouter", model: "z-ai/glm-5.2:free" },
    { provider: "openrouter", model: "qwen/qwen3.8-27b:free" },
    { provider: "openrouter", model: "nvidia/nemotron-3.5-lightning:free" }
  ].filter(c => findModel(liveModels, c.provider, c.model));

  // Phase 8: Sonnet (Reasoning)
  const sonnetRaw = [
    { provider: "antigravity", model: "claude-sonnet-4-6" },
    { provider: "bluesminds", model: "deepseek-reasoner" },
    { provider: "antigravity", model: "claude-opus-4-6-thinking" },
    { provider: "github", model: "gpt-4o-2024-11-20" },
    { provider: "kiro", model: "glm-5" },
    { provider: "huggingchat", model: "CohereLabs/command-a-reasoning-08-2025" }
  ].filter(c => findModel(liveModels, c.provider, c.model));

  // Phase 9: Opus (Coding / Round-Robin)
  const opusRaw = [
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

  // Phase 13: Fable (God-Mode / Round-Robin)
  const fableRaw = [
    { provider: "github", model: "gpt-4o-2024-11-20" },
    { provider: "antigravity", model: "claude-opus-4-6-thinking" },
    { provider: "antigravity", model: "gemini-3.1-pro-low" },
    { provider: "openrouter", model: "moonshotai/kimi-k3" },
    { provider: "openrouter", model: "z-ai/glm-5.3" },
    { provider: "openrouter", model: "qwen/qwen-3.8-coder-32b-instruct" }
  ].filter(c => findModel(liveModels, c.provider, c.model));

  const cliArgs = process.argv.slice(2);
  const excludePaid = cliArgs.includes("--exclude-paid") || cliArgs.includes("--free-only") ||
    process.env.LIMITLESS_EXCLUDE_PAID === "true" || process.env.LIMITLESS_EXCLUDE_PAID === "1";
  const allowUnknown = cliArgs.includes("--allow-unknown") ||
    process.env.LIMITLESS_ALLOW_UNKNOWN_BILLING === "true" || process.env.LIMITLESS_ALLOW_UNKNOWN_BILLING === "1";

  let haikuCandidates = haikuRaw;
  let sonnetCandidates = sonnetRaw;
  let opusCandidates = opusRaw;
  let fableCandidates = fableRaw;

  if (excludePaid) {
    haikuCandidates = filterCandidatesByBilling(haikuCandidates, true, allowUnknown);
    sonnetCandidates = filterCandidatesByBilling(sonnetCandidates, true, allowUnknown);
    opusCandidates = filterCandidatesByBilling(opusCandidates, true, allowUnknown);
    fableCandidates = filterCandidatesByBilling(fableCandidates, true, allowUnknown);
    console.log("Enforced paid-model safety guard: excluded chargeable/unknown candidates from routing combos.");
    if (haikuCandidates.length === 0) console.warn("\x1b[33m[WARNING] Haiku tier has 0 candidates after applying paid model guard.\x1b[0m");
    if (sonnetCandidates.length === 0) console.warn("\x1b[33m[WARNING] Sonnet tier has 0 candidates after applying paid model guard.\x1b[0m");
    if (opusCandidates.length === 0) console.warn("\x1b[33m[WARNING] Opus tier has 0 candidates after applying paid model guard.\x1b[0m");
    if (fableCandidates.length === 0) console.warn("\x1b[33m[WARNING] Fable tier has 0 candidates after applying paid model guard.\x1b[0m");
  }

  const totalCandidates = haikuCandidates.length + sonnetCandidates.length + opusCandidates.length + fableCandidates.length;
  if (totalCandidates === 0) {
    console.error("\x1b[31m[ERROR] No usable candidate models found across any tier.\x1b[0m");
    console.error("Please connect at least one provider (e.g. OpenRouter, GitHub, Groq) in OmniRoute at http://localhost:20128 and try again.");
    db.close();
    process.exitCode = 1;
    return;
  }

  // Database Transaction to ensure atomicity
  const applySetup = db.transaction(() => {
    // Clean old exact matches
    const delCombos = db.prepare("DELETE FROM combos WHERE id IN (?, ?, ?, ?)");
    delCombos.run(COMBO_IDS.opus, COMBO_IDS.sonnet, COMBO_IDS.haiku, COMBO_IDS.fable);

    const delMappings = db.prepare("DELETE FROM model_combo_mappings WHERE id IN (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    delMappings.run(
      MAPPING_IDS.opus, MAPPING_IDS.sonnet, MAPPING_IDS.haiku, MAPPING_IDS.fable,
      MAPPING_IDS.best, MAPPING_IDS.opusplan, MAPPING_IDS.default, MAPPING_IDS.sonnet1m, MAPPING_IDS.opus1m
    );

    const insertCombo = db.prepare(
      "INSERT INTO combos (id, name, data, system_message, created_at, updated_at) " +
      "VALUES (?, ?, ?, ?, datetime('now'), datetime('now')) " +
      "ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, system_message = excluded.system_message, updated_at = datetime('now')"
    );

    // Haiku
    insertCombo.run(COMBO_IDS.haiku, "Limitless Haiku Tier", JSON.stringify({
      name: "Limitless Haiku Tier",
      strategy: "priority",
      description: "Fastest reliable models.",
      models: haikuCandidates
    }), "You are an advanced assistant optimized for rapid syntax lookups and lightning-fast codebase searches. Do not output conversational filler. Execute tool calls instantly. Your priority is absolute speed and precision.");

    // Sonnet
    insertCombo.run(COMBO_IDS.sonnet, "Limitless Sonnet Tier", JSON.stringify({
      name: "Limitless Sonnet Tier",
      strategy: "priority",
      description: "Best planning / architecture / reasoning",
      models: sonnetCandidates
    }), "You are an advanced architectural model. You excel at chain-of-thought reasoning, medium-effort architectural tasks, and multi-agent development environments. Plan carefully before writing code, and ensure flawless tool execution.");

    // Opus
    insertCombo.run(COMBO_IDS.opus, "Limitless Opus Tier", JSON.stringify({
      name: "Limitless Opus Tier",
      strategy: "round-robin",
      description: "Largest free coding reservoir (Load-Balanced)",
      models: opusCandidates
    }), "You are a massive reasoning and coding powerhouse. You possess deep knowledge of backend development, frontend design, and multi-agent architectures. You effortlessly handle high-effort tasks and massive refactors. Write flawless, production-ready code.");

    // Fable
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
    } catch (_) {}

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
    insertMap.run(...mapArgs(MAPPING_IDS.opusplan, "*opusplan*", COMBO_IDS.sonnet, 11, "Opusplan route (Sonnet)"));
    insertMap.run(...mapArgs(MAPPING_IDS.default, "*default*", COMBO_IDS.opus, 8, "Default route (Opus)"));
    insertMap.run(...mapArgs(MAPPING_IDS.sonnet1m, "*sonnet[1m]*", COMBO_IDS.sonnet, 11, "Sonnet 1M context"));
    insertMap.run(...mapArgs(MAPPING_IDS.opus1m, "*opus[1m]*", COMBO_IDS.opus, 11, "Opus 1M context"));

    // Safe API Key Permission Check / Update
    if (apiKey) {
      const permResult = safelyConfigureComboPermissions(db, apiKey, Object.values(COMBO_IDS));
      const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 6)}...` : "[redacted]";
      if (permResult.changed) {
        console.log(`Configured combo access for key [${maskedKey}]: preserved mode '${permResult.mode}', permitted combos.`);
      } else if (permResult.status === "unsupported_schema") {
        console.warn(`\x1b[33m[WARNING] Could not configure permissions for key [${maskedKey}]: ${permResult.message}\x1b[0m`);
      }
    }

    return {
      haikuCandidates,
      sonnetCandidates,
      opusCandidates,
      fableCandidates,
      haikuAnnotated: mapWithBilling(haikuCandidates),
      sonnetAnnotated: mapWithBilling(sonnetCandidates),
      opusAnnotated: mapWithBilling(opusCandidates),
      fableAnnotated: mapWithBilling(fableCandidates)
    };
  });

  let results;
  try {
    results = applySetup();
  } catch (err) {
    console.error("\x1b[31m[ERROR] Database transaction failed. Rolling back changes.\x1b[0m", err.message);
    db.close();
    process.exitCode = 1;
    return;
  }

  // Save tier configuration correctly (Preserving existing benchmark / custom fields)
  const tierConfigPath = path.join(configDir, "tier-configuration.json");
  let existingConfig = {};
  if (fs.existsSync(tierConfigPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(tierConfigPath, "utf8"));
    } catch (e) {
      console.warn("Could not parse existing tier-configuration.json, proceeding with clean base config.");
      existingConfig = {};
    }
  }

  const updatedConfig = Object.assign({}, existingConfig, {
    haiku: results.haikuCandidates,
    sonnet: results.sonnetCandidates,
    opus: results.opusCandidates,
    fable: results.fableCandidates,
    metadata: {
      version: "4.5.0",
      source: isLiveCatalog ? "live_gateway" : "offline_cache",
      last_scanned: new Date().toISOString(),
      paid_models_excluded: excludePaid,
      models_with_billing: {
        haiku: results.haikuAnnotated,
        sonnet: results.sonnetAnnotated,
        opus: results.opusAnnotated,
        fable: results.fableAnnotated
      }
    }
  });

  try {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(tierConfigPath, JSON.stringify(updatedConfig, null, 2));
  } catch (err) {
    console.error("Error: Could not write tier-configuration.json:", err.message);
    db.close();
    process.exitCode = 1;
    return;
  }

  // Phase 20: Auto-boot Daemon
  try {
    const isWindows = os.platform() === 'win32';
    const isTesting = !!process.env.TEST_STARTUP_DIR;

    if (isWindows || isTesting) {
      const startupDir = process.env.TEST_STARTUP_DIR || path.join(os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
      if (fs.existsSync(startupDir)) {
        // 1. Clean up old corrupted startup files precisely
        const exactMatches = ["Limitless-OmniRoute-Launcher.vbs"];
        exactMatches.forEach(f => {
          const fp = path.join(startupDir, f);
          if (fs.existsSync(fp)) {
            try { fs.unlinkSync(fp); } catch (_) {}
          }
        });

        // 2. Put the loop BAT file inside the startup directory or project directory, but isolate for tests
        const batDir = process.env.TEST_STARTUP_DIR || path.join(__dirname, '..');
        const batPath = path.join(batDir, 'omniroute-daemon.bat');
        const npmBinPath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'npm', 'omniroute.cmd');
        const pnpmBinPath = path.join(os.homedir(), 'AppData', 'Local', 'pnpm', 'bin', 'omniroute.CMD');

        // Prefer global npm/pnpm executable if present; fallback to npx
        let cmdToRun = 'npx omniroute';
        if (fs.existsSync(npmBinPath)) {
          cmdToRun = `"${npmBinPath}"`;
        } else if (fs.existsSync(pnpmBinPath)) {
          cmdToRun = `"${pnpmBinPath}"`;
        }

        const batContent = `@echo off\r\n:loop\r\n${cmdToRun} serve\r\necho OmniRoute crashed. Restarting in 5 seconds...\r\ntimeout /t 5 >nul\r\ngoto loop\r\n`;
        fs.writeFileSync(batPath, batContent);

        // 3. Put ONLY the VBS wrapper in Startup so it runs silently
        const vbsPath = path.join(startupDir, "Limitless-OmniRoute-Launcher.vbs");
        // Add a 10 second delay so Windows network initializes before omniroute starts
        const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\r\nWScript.Sleep 10000\r\nWshShell.Run """" & "${batPath}" & """", 0, False\r\n`;
        fs.writeFileSync(vbsPath, vbsContent);

        console.log("Installed invisible OmniRoute auto-recovery daemon to Windows Startup.");
      }
    }

    // Unix / macOS launcher script
    const shDir = process.env.TEST_STARTUP_DIR || path.join(__dirname, '..');
    const shPath = path.join(shDir, 'start-daemon.sh');
    const shContent = `#!/bin/bash\n# Limitless Claude Background Launcher for Linux / macOS\n# Note: Launches OmniRoute in the background using nohup. It is not an auto-restarting service.\n\nif command -v nc >/dev/null 2>&1 && nc -z 127.0.0.1 20128 2>/dev/null; then\n    echo "OmniRoute gateway is already running and listening on port 20128."\n    echo "You can now run 'claude' in your terminal."\n    exit 0\nfi\n\nif ! command -v npx >/dev/null 2>&1 && ! command -v omniroute >/dev/null 2>&1; then\n    echo "Error: Neither 'omniroute' nor 'npx' was found in PATH."\n    echo "Please ensure Node.js and npm are installed: https://nodejs.org/"\n    exit 1\nfi\n\nCMD="npx omniroute"\nif command -v omniroute >/dev/null 2>&1; then\n    CMD="omniroute"\nfi\n\necho "Starting Limitless Claude (OmniRoute) in the background..."\nnohup $CMD serve > omniroute.log 2>&1 &\nPID=$!\necho "Daemon started with PID $PID."\necho "Logs streaming to ./omniroute.log"\necho "You can now run 'claude' in your terminal."\n`;
    fs.writeFileSync(shPath, shContent);
    try {
      fs.chmodSync(shPath, 0o755);
    } catch (_) {}
  } catch (e) {
    console.log("Could not install background startup daemon:", e.message);
  }

  db.close();
  console.log("\x1b[36m%s\x1b[0m", "\n=== Limitless Claude Setup Complete! ===");
  console.log(`\x1b[33mHaiku models:\x1b[0m ${results.haikuCandidates.length}`);
  console.log(`\x1b[33mSonnet models:\x1b[0m ${results.sonnetCandidates.length}`);
  console.log(`\x1b[33mOpus models:\x1b[0m ${results.opusCandidates.length}`);
  console.log(`\x1b[33mFable models:\x1b[0m ${results.fableCandidates.length}\n`);
  console.log("You can now run \x1b[1mclaude\x1b[0m in your terminal.");
}

module.exports = {
  runSetup,
  classifyModelBilling,
  filterCandidatesByBilling,
  COMBO_IDS,
  MAPPING_IDS
};

if (require.main === module) {
  runSetup().catch(err => {
    console.error("Fatal setup error:", err);
    process.exit(1);
  });
}
