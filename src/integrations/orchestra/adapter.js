/**
 * Limitless Claude 8.0 - Optional Orchestra Interoperability Adapter (Mode B)
 * 
 * Provides clean, decoupled contract consumption when Orchestra is detected:
 * - Translates Orchestra task categories to Limitless capability profiles
 * - Forwards model tier recommendations (Haiku, Sonnet, Opus, Fable)
 * - Safe fallback to Standalone Mode (Mode A) when Orchestra is absent
 * - Zero circular dependencies; core runtime never imports this module.
 */

class OrchestraAdapter {
  constructor(options = {}) {
    this.enabled = options.enabled !== undefined ? options.enabled : this.detectOrchestra();
  }

  detectOrchestra() {
    return !!(process.env.ORCHESTRA_CONTRACT || process.env.ORCHESTRA_VAULT || process.env.ORCHESTRA_ENGINE);
  }

  isAvailable() {
    return this.enabled;
  }

  mapTaskToCapability(orchestraTask = "") {
    const t = String(orchestraTask).toLowerCase();

    if (t.includes("3d") || t.includes("shader") || t.includes("webgl") || t.includes("r3f")) {
      return "3d";
    }
    if (t.includes("frontend") || t.includes("react") || t.includes("css") || t.includes("design") || t.includes("taste")) {
      return "frontend";
    }
    if (t.includes("backend") || t.includes("postgres") || t.includes("supabase") || t.includes("api") || t.includes("rls")) {
      return "backend";
    }
    if (t.includes("architecture") || t.includes("reasoning") || t.includes("grill") || t.includes("domain") || t.includes("diagram")) {
      return "reasoning";
    }
    if (t.includes("review") || t.includes("audit") || t.includes("security") || t.includes("forensics")) {
      return "review";
    }
    if (t.includes("fast") || t.includes("patch") || t.includes("syntax")) {
      return "fast";
    }
    if (t.includes("docs") || t.includes("paper") || t.includes("readme")) {
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
  defaultOrchestraAdapter
};
