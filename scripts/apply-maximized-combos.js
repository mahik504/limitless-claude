const { getDatabase } = require('../src/omniroute/db');

try {
  const db = getDatabase({ readonly: false });

  const haikuModels = [
    { provider: "kiro", model: "claude-haiku-4.5" },
    { provider: "cloudflare-ai", model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" },
    { provider: "github", model: "gpt-4o-mini" },
    { provider: "groq", model: "openai/gpt-oss-20b" },
    { provider: "cloudflare-ai", model: "@cf/zai-org/glm-4.7-flash" },
    { provider: "openrouter", model: "nvidia/nemotron-3.5-lightning:free" }
  ];

  const sonnetModels = [
    { provider: "kiro", model: "claude-sonnet-4.5" },
    { provider: "kiro", model: "glm-5" },
    { provider: "github", model: "gpt-4o-2024-11-20" },
    { provider: "cloudflare-ai", model: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" },
    { provider: "kiro", model: "qwen3-coder-next" },
    { provider: "kiro", model: "deepseek-3.2" }
  ];

  const fableModels = [
    { provider: "kiro", model: "claude-sonnet-4.5" },
    { provider: "github", model: "gpt-4o-2024-11-20" },
    { provider: "mistral", model: "codestral-latest" },
    { provider: "kiro", model: "glm-5" },
    { provider: "cloudflare-ai", model: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" }
  ];

  const opusModels = [
    { provider: "mistral", model: "codestral-latest" },
    { provider: "kiro", model: "claude-sonnet-4.5" },
    { provider: "kiro", model: "qwen3-coder-next" },
    { provider: "kiro", model: "glm-5" },
    { provider: "kiro", model: "deepseek-3.2" },
    { provider: "kiro", model: "minimax-m2.1" },
    { provider: "cloudflare-ai", model: "@cf/qwen/qwen2.5-coder-32b-instruct" },
    { provider: "cloudflare-ai", model: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" },
    { provider: "cloudflare-ai", model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" },
    { provider: "cloudflare-ai", model: "@cf/qwen/qwq-32b" },
    { provider: "github", model: "gpt-4o-2024-11-20" },
    { provider: "groq", model: "openai/gpt-oss-120b" },
    { provider: "openrouter", model: "nvidia/nemotron-3-ultra-550b-a55b:free" },
    { provider: "kilo-gateway", model: "nvidia/nemotron-3-ultra-550b-a55b:free" },
    { provider: "openrouter", model: "cohere/north-mini-code:free" },
    { provider: "kilo-gateway", model: "cohere/north-mini-code:free" },
    { provider: "openrouter", model: "nvidia/nemotron-3.5-lightning:free" },
    { provider: "kilo-gateway", model: "nvidia/nemotron-3.5-lightning:free" },
    { provider: "openrouter", model: "liquid/lfm-2.5-2.6b:free" },
    { provider: "cloudflare-ai", model: "@cf/meta/llama-3.2-3b-instruct" },
    { provider: "groq", model: "openai/gpt-oss-20b" },
    { provider: "cloudflare-ai", model: "@cf/zai-org/glm-4.7-flash" },
    { provider: "openrouter", model: "dots-studio/dots-3-note-preview:free" }
  ];

  function updateCombo(id, name, desc, models) {
    const existing = db.prepare("SELECT * FROM combos WHERE id = ?").get(id);
    const existingData = existing ? JSON.parse(existing.data || "{}") : {};
    existingData.name = name;
    existingData.description = desc;
    existingData.strategy = "round-robin";
    existingData.models = models;

    const dataJson = JSON.stringify(existingData);
    db.prepare("UPDATE combos SET data = ?, updated_at = datetime('now') WHERE id = ?").run(dataJson, id);
    console.log(`Updated combo: ${id} with ${models.length} active models`);
  }

  updateCombo(
    "combo/limitless-haiku",
    "Limitless Haiku 5.5 Tier",
    "Fastest syntax verification, atomic file edits, and rapid tool execution.",
    haikuModels
  );

  updateCombo(
    "combo/limitless-sonnet",
    "Limitless Sonnet 5.5 Tier",
    "Frontier system design, architectural reasoning, and multi-turn debugging.",
    sonnetModels
  );

  updateCombo(
    "combo/limitless-fable",
    "Limitless Fable 5.1 Tier",
    "God-mode composite intelligence with frontier reasoning & thinking models.",
    fableModels
  );

  updateCombo(
    "combo/limitless-opus",
    "Limitless Opus 5.5 Tier",
    "High-capacity agentic coding reservoir across 23 multi-provider models.",
    opusModels
  );

  console.log("Successfully updated all 4 Limitless Claude combos with verified models!");
} catch (err) {
  console.error("Failed to update combos:", err.message);
  process.exit(1);
}
