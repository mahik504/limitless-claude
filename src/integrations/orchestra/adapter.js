/**
 * Limitless Claude 8.2 - Orchestra interoperability adapter (Mode B)
 *
 * Provides clean, decoupled contract consumption when Orchestra is detected:
 * - Translates Orchestra task categories and skills to Limitless capability profiles
 * - Forwards model tier recommendations (Haiku, Sonnet, Opus, Fable)
 * - Detects local Orchestra installations (C:/projects/orchestra-workflow, ~/orchestra-workflow)
 * - Safe fallback to Standalone Mode (Mode A) when Orchestra is absent
 * - Zero circular dependencies; core runtime never imports this module directly.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

function adapterMatches(content, version) {
  const text = String(content || "");
  if (text.includes("<!-- orchestra:start -->") || text.includes("<!-- orchestra:end -->")) return true;
  const match = String(version || "").match(/^(\d+\.\d+)/);
  return Boolean(match && text.includes(`Orchestra ${match[1]}`));
}

class OrchestraAdapter {
  constructor(options = {}) {
    this.candidatePaths = [
      path.resolve("C:/projects/orchestra-workflow"),
      path.join(os.homedir(), "projects", "orchestra-workflow"),
      path.join(os.homedir(), "orchestra-workflow")
    ];
    this.enabled = options.enabled !== undefined ? options.enabled : this.detectOrchestra();
  }

  detectOrchestra() {
    if (process.env.ORCHESTRA_CONTRACT || process.env.ORCHESTRA_VAULT || process.env.ORCHESTRA_ENGINE) {
      return true;
    }

    try {
      return this.candidatePaths.some(p => fs.existsSync(p));
    } catch (_) {
      return false;
    }
  }

  getOrchestraPath() {
    for (const p of this.candidatePaths) {
      try {
        if (fs.existsSync(p)) return p;
      } catch (_) {}
    }
    return null;
  }

  getDetails() {
    const orchPath = this.getOrchestraPath();
    if (!orchPath) {
      return {
        detected: false,
        version: null,
        path: null,
        skillsCount: 0,
        claudeAdapterSynced: false
      };
    }

    let version = "unknown";
    try {
      const vPath = path.join(orchPath, "VERSION");
      if (fs.existsSync(vPath)) {
        version = fs.readFileSync(vPath, "utf8").trim() || "unknown";
      }
    } catch (_) {}

    let skillsCount = 0;
    try {
      const sPath = path.join(orchPath, "skills");
      if (fs.existsSync(sPath)) {
        skillsCount = fs.readdirSync(sPath).filter(f => !f.startsWith(".")).length;
      }
    } catch (_) {}

    const claudeMd = path.join(os.homedir(), ".claude", "CLAUDE.md");
    let claudeAdapterSynced = false;
    try {
      if (fs.existsSync(claudeMd)) {
        const content = fs.readFileSync(claudeMd, "utf8");
        claudeAdapterSynced = adapterMatches(content, version);
      }
    } catch (_) {}

    return {
      detected: true,
      version,
      path: orchPath,
      skillsCount,
      claudeAdapterSynced
    };
  }

  isAvailable() {
    return this.enabled;
  }

  mapTaskToCapability(orchestraTask = "") {
    const t = String(orchestraTask).toLowerCase();

    // 3D Scene / Shaders
    if (t.includes("3d") || t.includes("shader") || t.includes("webgl") || t.includes("r3f") || t.includes("ow-3d")) {
      return "3d";
    }
    // Frontend / Design / Animation
    if (t.includes("frontend") || t.includes("react") || t.includes("css") || t.includes("design") || 
        t.includes("taste") || t.includes("impeccable") || t.includes("golden-still") || t.includes("scroll") || 
        t.includes("gsap") || t.includes("award-style")) {
      return "frontend";
    }
    // Backend / Database / APIs
    if (t.includes("backend") || t.includes("postgres") || t.includes("supabase") || t.includes("api") || 
        t.includes("rls") || t.includes("ow-backend") || t.includes("test-driven") || t.includes("saas")) {
      return "backend";
    }
    // Architecture / Reasoning / Diagrams
    if (t.includes("architecture") || t.includes("reasoning") || t.includes("grill") || t.includes("domain") || 
        t.includes("diagram") || t.includes("ow-diagrams")) {
      return "reasoning";
    }
    // Review / Forensics / Security
    if (t.includes("review") || t.includes("audit") || t.includes("security") || t.includes("forensics") || 
        t.includes("systematic-debugging") || t.includes("semgrep") || t.includes("ponytail") || t.includes("ow-review")) {
      return "review";
    }
    // Fast syntax / patches
    if (t.includes("fast") || t.includes("patch") || t.includes("syntax") || t.includes("bug")) {
      return "fast";
    }
    // Documentation / Papers / Marketing
    if (t.includes("docs") || t.includes("paper") || t.includes("readme") || t.includes("ow-docs") || 
        t.includes("presentation") || t.includes("marketing") || t.includes("humanizer") || t.includes("research-paper")) {
      return "documentation";
    }

    return "balanced";
  }

  consumeContract(contract = {}) {
    if (!this.isAvailable()) {
      return {
        mode: "STANDALONE_FALLBACK",
        capability: "balanced",
        tier: "limitless-sonnet-5.5",
        active: false,
        notes: "Orchestra not detected; running under standalone defaults."
      };
    }

    const taskName = contract.task || contract.job || contract.category || "balanced";
    const mappedCapability = this.mapTaskToCapability(taskName);

    let recommendedTier = "limitless-sonnet-5.5";
    if (mappedCapability === "fast") recommendedTier = "limitless-haiku-4.5";
    if (mappedCapability === "frontend" || mappedCapability === "3d" || mappedCapability === "backend") recommendedTier = "limitless-opus-4.6";
    if (mappedCapability === "reasoning" || mappedCapability === "review") recommendedTier = "limitless-sonnet-5.5";

    return {
      mode: "ORCHESTRA_INTEROP",
      active: true,
      orchestraTask: taskName,
      capability: mappedCapability,
      recommendedTier,
      constraints: contract.constraints || [],
      skills: contract.skills || [],
      acceptanceCriteria: contract.acceptance || []
    };
  }
}

const defaultOrchestraAdapter = new OrchestraAdapter();

module.exports = {
  OrchestraAdapter,
  adapterMatches,
  defaultOrchestraAdapter
};
