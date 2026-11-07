/**
 * Limitless Claude 7.0 - Multi-Client Agent Compatibility Layer
 * 
 * Maps and translates protocol idiosyncrasies across supported client harnesses:
 * - Claude Code CLI (@anthropic-ai/claude-code)
 * - Claude Code VS Code / Cursor Extension
 * - Superdesign / Open Design CLI (@superdesign/cli)
 * - OpenCode CLI / Extension
 * - Antigravity IDE & CLI
 * - Cursor AI Editor
 */

const CLIENT_TYPES = {
  CLAUDE_CODE_CLI: "claude-code-cli",
  CLAUDE_CODE_EXT: "claude-code-ext",
  SUPERDESIGN: "superdesign",
  OPENCODE: "opencode",
  ANTIGRAVITY: "antigravity",
  CURSOR: "cursor",
  GENERIC_ANTHROPIC: "generic-anthropic",
  GENERIC_OPENAI: "generic-openai"
};

const CLIENT_COMPATIBILITY_MATRIX = {
  [CLIENT_TYPES.CLAUDE_CODE_CLI]: {
    name: "Claude Code CLI",
    protocol: "anthropic-messages",
    headerAuth: "x-api-key",
    supportsTools: true,
    toolCallStyle: "anthropic-tool-use",
    systemPromptLocation: "top-level",
    expectsThinkingTags: true,
    streamSupport: true,
    recommendedTier: "fable"
  },
  [CLIENT_TYPES.CLAUDE_CODE_EXT]: {
    name: "Claude Code Extension",
    protocol: "anthropic-messages",
    headerAuth: "x-api-key",
    supportsTools: true,
    toolCallStyle: "anthropic-tool-use",
    systemPromptLocation: "top-level",
    expectsThinkingTags: true,
    streamSupport: true,
    recommendedTier: "fable"
  },
  [CLIENT_TYPES.SUPERDESIGN]: {
    name: "Superdesign / Open Design",
    protocol: "anthropic-messages",
    headerAuth: "x-api-key",
    supportsTools: true,
    toolCallStyle: "anthropic-tool-use",
    systemPromptLocation: "top-level",
    expectsThinkingTags: false,
    streamSupport: true,
    recommendedTier: "sonnet"
  },
  [CLIENT_TYPES.OPENCODE]: {
    name: "OpenCode CLI / Extension",
    protocol: "openai-chat",
    headerAuth: "authorization-bearer",
    supportsTools: true,
    toolCallStyle: "openai-tool-calls",
    systemPromptLocation: "messages-system",
    expectsThinkingTags: false,
    streamSupport: true,
    recommendedTier: "sonnet"
  },
  [CLIENT_TYPES.ANTIGRAVITY]: {
    name: "Antigravity IDE & CLI",
    protocol: "anthropic-messages",
    headerAuth: "x-api-key",
    supportsTools: true,
    toolCallStyle: "anthropic-tool-use",
    systemPromptLocation: "top-level",
    expectsThinkingTags: true,
    streamSupport: true,
    recommendedTier: "opus"
  },
  [CLIENT_TYPES.CURSOR]: {
    name: "Cursor AI Editor",
    protocol: "openai-chat",
    headerAuth: "authorization-bearer",
    supportsTools: true,
    toolCallStyle: "openai-tool-calls",
    systemPromptLocation: "messages-system",
    expectsThinkingTags: false,
    streamSupport: true,
    recommendedTier: "sonnet"
  }
};

class AgentClientManager {
  constructor() {
    this.matrix = CLIENT_COMPATIBILITY_MATRIX;
  }

  detectClient(headers = {}, userAgent = "") {
    const ua = (userAgent || headers["user-agent"] || "").toLowerCase();
    const anthropicVersion = headers["anthropic-version"];
    const anthropicClient = headers["anthropic-client"] || "";

    if (ua.includes("superdesign") || ua.includes("open-design")) {
      return CLIENT_TYPES.SUPERDESIGN;
    }
    if (ua.includes("claude-code") || anthropicClient.includes("claude-code")) {
      return ua.includes("code-extension") || ua.includes("vscode") 
        ? CLIENT_TYPES.CLAUDE_CODE_EXT 
        : CLIENT_TYPES.CLAUDE_CODE_CLI;
    }
    if (ua.includes("opencode")) {
      return CLIENT_TYPES.OPENCODE;
    }
    if (ua.includes("antigravity")) {
      return CLIENT_TYPES.ANTIGRAVITY;
    }
    if (ua.includes("cursor")) {
      return CLIENT_TYPES.CURSOR;
    }
    if (anthropicVersion) {
      return CLIENT_TYPES.GENERIC_ANTHROPIC;
    }
    return CLIENT_TYPES.GENERIC_OPENAI;
  }

  getSpecs(clientType) {
    return this.matrix[clientType] || {
      name: clientType,
      protocol: "openai-chat",
      headerAuth: "authorization-bearer",
      supportsTools: true,
      toolCallStyle: "openai-tool-calls",
      systemPromptLocation: "messages-system",
      expectsThinkingTags: false,
      streamSupport: true,
      recommendedTier: "sonnet"
    };
  }

  formatPayloadForClient(payload, targetClientType) {
    const specs = this.getSpecs(targetClientType);
    const cloned = JSON.parse(JSON.stringify(payload));

    // Handle system message positioning
    if (specs.systemPromptLocation === "top-level") {
      if (!cloned.system && Array.isArray(cloned.messages)) {
        const sysIdx = cloned.messages.findIndex(m => m.role === "system");
        if (sysIdx !== -1) {
          cloned.system = cloned.messages[sysIdx].content;
          cloned.messages.splice(sysIdx, 1);
        }
      }
    } else if (specs.systemPromptLocation === "messages-system") {
      if (cloned.system) {
        if (!Array.isArray(cloned.messages)) cloned.messages = [];
        cloned.messages.unshift({ role: "system", content: cloned.system });
        delete cloned.system;
      }
    }

    return cloned;
  }
}

const defaultAgentClientManager = new AgentClientManager();

module.exports = {
  CLIENT_TYPES,
  CLIENT_COMPATIBILITY_MATRIX,
  AgentClientManager,
  defaultAgentClientManager
};
