const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(process.env.USERPROFILE || process.env.HOME, '.omniroute', 'storage.sqlite');

if (!fs.existsSync(dbPath)) {
  console.error("❌ OmniRoute database not found.");
  console.error("Please ensure you have installed OmniRoute and started it at least once before running this script.");
  console.error(`Expected path: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

console.log("🚀 Starting Limitless Claude Master Architecture Configuration...");

try {
  // 1. Opus Combo
  const opusModels = [
    {provider: 'kiro', model: 'glm-5', priority: 100, enabled: true},
    {provider: 'openrouter', model: 'z-ai/glm-5.3-flash', priority: 99, enabled: true},
    {provider: 'cloudflare-ai', model: '@cf/zai-org/glm-4.7-flash', priority: 98, enabled: true},
    {provider: 'openrouter', model: 'z-ai/glm-5.2:free', priority: 97, enabled: true},
    {provider: 'kiro', model: 'deepseek-3.2', priority: 96, enabled: true},
    {provider: 'kiro', model: 'qwen3-coder-next', priority: 95, enabled: true},
    {provider: 'kiro', model: 'claude-sonnet-5', priority: 94, enabled: true},
    {provider: 'openrouter', model: 'cohere/north-mini-code:free', priority: 93, enabled: true},
    {provider: 'openrouter', model: 'poolside/laguna-s-2.1:free', priority: 92, enabled: true}
  ];
  
  const opusData = JSON.stringify({
    name: "Claude Opus Tier (GLM Fleet + Elite Coding)",
    strategy: "priority",
    description: "ALL GLM models first, followed by elite coding models across all providers",
    models: opusModels
  });
  
  const opusSystem = "You are Claude Opus 5, Anthropic's most capable model. When asked who you are, identify as Claude Opus 5 (1M context). Your specialty is elite-tier software engineering, deep logic, and complex architectural problem-solving.";

  // 2. Sonnet Combo
  const sonnetModels = [
    {provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', priority: 100, enabled: true},
    {provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', priority: 99, enabled: true},
    {provider: 'kiro', model: 'deepseek-3.2', priority: 98, enabled: true},
    {provider: 'kiro', model: 'claude-sonnet-5', priority: 97, enabled: true}
  ];
  
  const sonnetData = JSON.stringify({
    name: "Claude Sonnet Tier (Reasoning & Architecture)",
    strategy: "priority",
    description: "Top reasoning models. NO <think> tags.",
    models: sonnetModels
  });
  
  const sonnetSystem = "You are Claude 3.5 Sonnet, Anthropic's advanced model. When asked who you are, identify as Claude 3.5 Sonnet. Your specialty is fast reasoning, brainstorming, and high-level architecture planning. Do not use <think> tags.";

  // 3. High-Q Combo
  const highqModels = [
    {provider: 'openrouter', model: 'cohere/north-mini-code:free', priority: 100, enabled: true},
    {provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', priority: 99, enabled: true},
    {provider: 'groq', model: 'openai/gpt-oss-120b', priority: 98, enabled: true},
    {provider: 'bluesminds', model: 'claude-haiku-4-5', priority: 97, enabled: true}
  ];
  
  const highqData = JSON.stringify({
    name: "Claude High-Q Tier (Ultra-Fast)",
    strategy: "priority",
    description: "Fastest sub-second models. NO <think> tags.",
    models: highqModels
  });
  
  const highqSystem = "You are Claude High-Q, Anthropic's ultra-fast model. When asked who you are, identify as Claude High-Q. Your specialty is rapid responses, quick chats, and basic debugging. Do not use <think> tags.";

  // Insert or Update Combos
  const upsertCombo = db.prepare(`
    INSERT INTO combos (id, name, data, sort_order, created_at, updated_at, system_message) 
    VALUES (?, ?, ?, 0, datetime('now'), datetime('now'), ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, system_message = excluded.system_message, updated_at = datetime('now')
  `);

  upsertCombo.run('combo/claude-opus', 'Claude Opus Tier', opusData, opusSystem);
  upsertCombo.run('combo/claude-sonnet', 'Claude Sonnet Tier', sonnetData, sonnetSystem);
  upsertCombo.run('combo/claude-high-q', 'Claude High-Q Tier', highqData, highqSystem);
  
  console.log("✅ Combos & System Messages Injected!");

  // Update Mappings
  db.prepare("DELETE FROM model_combo_mappings WHERE pattern LIKE '%opus%' OR pattern LIKE '%sonnet%' OR pattern LIKE '%haiku%' OR pattern LIKE '%high-q%'").run();
  
  const insertMap = db.prepare(`
    INSERT INTO model_combo_mappings (id, pattern, combo_id, priority, enabled, created_at, updated_at) 
    VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
  `);

  const uuidv4 = () => require('crypto').randomUUID();
  
  insertMap.run(uuidv4(), '*opus*', 'combo/claude-opus', 10);
  insertMap.run(uuidv4(), '*sonnet-1-million*', 'combo/claude-sonnet', 10);
  insertMap.run(uuidv4(), '*sonnet-5*', 'combo/claude-sonnet', 10);
  insertMap.run(uuidv4(), '*sonnet-3.5*', 'combo/claude-sonnet', 10);
  insertMap.run(uuidv4(), '*sonnet*', 'combo/claude-sonnet', 5);
  insertMap.run(uuidv4(), '*haiku*', 'combo/claude-high-q', 10);
  insertMap.run(uuidv4(), '*high-q*', 'combo/claude-high-q', 10);

  console.log("✅ Routing Mappings Locked!");

  // Automate Claude Code Settings to prevent "issue with selected model" errors
  const claudeSettingsPath = path.join(process.env.USERPROFILE || process.env.HOME, '.claude', 'settings.json');
  if (fs.existsSync(claudeSettingsPath)) {
    try {
      let settings = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf8'));
      if (!settings.env) settings.env = {};
      
      // Force the base URL to OmniRoute
      settings.env.ANTHROPIC_BASE_URL = "http://localhost:20128";
      
      // Force a valid Anthropic model name to bypass Claude Code's hardcoded CLI validation
      // (OmniRoute's *opus* mapping will still catch this and route it to GLM)
      settings.model = "claude-3-opus-20240229";
      
      fs.writeFileSync(claudeSettingsPath, JSON.stringify(settings, null, 2));
      console.log("✅ Claude Code settings.json automatically configured! (Model validation bypass applied)");
    } catch (err) {
      console.error("⚠️ Could not automatically update Claude Code settings.json:", err.message);
    }
  } else {
    console.log("⚠️ Claude Code settings.json not found. You may need to configure it manually.");
  }

  console.log("🎉 Setup Complete. Your Claude Code is now routing to the Limitless Claude Architecture!");
  
} catch (error) {
  console.error("❌ Error during setup:", error);
} finally {
  db.close();
}
