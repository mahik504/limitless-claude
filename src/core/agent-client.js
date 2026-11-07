/**
 * Limitless Claude 8.0 - Multi-Client Agent Compatibility & Protocol Layer
 * 
 * Maps and translates protocol idiosyncrasies across supported client harnesses:
 * - Claude Code CLI (@anthropic-ai/claude-code)
 * - Claude Code VS Code / Cursor Extension
 * - Superdesign / Open Design CLI (@superdesign/cli)
 * - OpenCode CLI / Extension
 * - Antigravity IDE & CLI
 * - Cursor AI Editor
 * - Generic Anthropic Messages API
 * - Generic OpenAI Chat Completions API
 * 
 * Features bidirectional tool schema, tool call, message history, and SSE stream translation.
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
  },
  [CLIENT_TYPES.GENERIC_ANTHROPIC]: {
    name: "Generic Anthropic Client",
    protocol: "anthropic-messages",
    headerAuth: "x-api-key",
    supportsTools: true,
    toolCallStyle: "anthropic-tool-use",
    systemPromptLocation: "top-level",
    expectsThinkingTags: false,
    streamSupport: true,
    recommendedTier: "sonnet"
  },
  [CLIENT_TYPES.GENERIC_OPENAI]: {
    name: "Generic OpenAI Client",
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
    const anthropicClient = (headers["anthropic-client"] || "").toLowerCase();

    if (ua.includes("superdesign") || ua.includes("open-design")) {
      return CLIENT_TYPES.SUPERDESIGN;
    }
    if (ua.includes("claude-code") || anthropicClient.includes("claude-code")) {
      return (ua.includes("code-extension") || ua.includes("vscode") || ua.includes("cursor"))
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
    return this.matrix[clientType] || this.matrix[CLIENT_TYPES.GENERIC_OPENAI];
  }

  // --- Bidirectional Tool Schema Translation ---

  translateToolsToOpenAI(tools = []) {
    if (!Array.isArray(tools)) return [];
    return tools.map(t => {
      if (t.type === "function" && t.function) return t; // Already OpenAI
      return {
        type: "function",
        function: {
          name: t.name,
          description: t.description || "",
          parameters: t.input_schema || t.parameters || { type: "object", properties: {} }
        }
      };
    });
  }

  translateToolsToAnthropic(tools = []) {
    if (!Array.isArray(tools)) return [];
    return tools.map(t => {
      if (t.input_schema && !t.function) return t; // Already Anthropic
      const fn = t.function || t;
      return {
        name: fn.name,
        description: fn.description || "",
        input_schema: fn.parameters || fn.input_schema || { type: "object", properties: {} }
      };
    });
  }

  // --- Bidirectional Message & Tool Call History Translation ---

  translateMessagesToOpenAI(messages = [], systemPrompt = null) {
    const result = [];

    if (systemPrompt) {
      result.push({ role: "system", content: systemPrompt });
    }

    for (const msg of messages) {
      if (msg.role === "system") {
        result.push(msg);
      } else if (msg.role === "assistant") {
        if (Array.isArray(msg.content)) {
          let text = "";
          const toolCalls = [];

          for (const block of msg.content) {
            if (block.type === "text") {
              text += block.text;
            } else if (block.type === "tool_use") {
              toolCalls.push({
                id: block.id,
                type: "function",
                function: {
                  name: block.name,
                  arguments: typeof block.input === "string" ? block.input : JSON.stringify(block.input || {})
                }
              });
            }
          }

          result.push({
            role: "assistant",
            content: text.length > 0 ? text : null,
            ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {})
          });
        } else {
          result.push(msg);
        }
      } else if (msg.role === "user") {
        if (Array.isArray(msg.content)) {
          let userText = "";
          for (const block of msg.content) {
            if (block.type === "tool_result") {
              result.push({
                role: "tool",
                tool_call_id: block.tool_use_id,
                content: typeof block.content === "string" ? block.content : JSON.stringify(block.content || "")
              });
            } else if (block.type === "text") {
              userText += block.text;
            }
          }
          if (userText.length > 0) {
            result.push({ role: "user", content: userText });
          }
        } else {
          result.push(msg);
        }
      } else {
        result.push(msg);
      }
    }

    return result;
  }

  translateMessagesToAnthropic(messages = []) {
    let system = null;
    const result = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        system = (system ? system + "\n\n" : "") + (typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content));
      } else if (msg.role === "tool") {
        // OpenAI tool responses map to Anthropic user message with tool_result block
        result.push({
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: msg.tool_call_id,
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
          }]
        });
      } else if (msg.role === "assistant") {
        if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
          const content = [];
          if (msg.content) {
            content.push({ type: "text", text: msg.content });
          }
          for (const tc of msg.tool_calls) {
            let parsedArgs = {};
            try {
              parsedArgs = typeof tc.function.arguments === "string" 
                ? JSON.parse(tc.function.arguments) 
                : (tc.function.arguments || {});
            } catch (_) {
              parsedArgs = { raw: tc.function.arguments };
            }

            content.push({
              type: "tool_use",
              id: tc.id,
              name: tc.function.name,
              input: parsedArgs
            });
          }
          result.push({ role: "assistant", content });
        } else {
          result.push({
            role: "assistant",
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
          });
        }
      } else {
        result.push(msg);
      }
    }

    return { system, messages: result };
  }

  // --- High-Level Payload Translation ---

  formatPayloadForClient(payload, targetClientType) {
    const specs = this.getSpecs(targetClientType);
    const cloned = JSON.parse(JSON.stringify(payload));

    if (specs.protocol === "openai-chat") {
      // Convert to OpenAI format
      const systemPrompt = cloned.system || null;
      delete cloned.system;

      cloned.messages = this.translateMessagesToOpenAI(cloned.messages || [], systemPrompt);
      if (cloned.tools) {
        cloned.tools = this.translateToolsToOpenAI(cloned.tools);
      }
    } else {
      // Convert to Anthropic format
      if (Array.isArray(cloned.messages)) {
        const { system, messages } = this.translateMessagesToAnthropic(cloned.messages);
        cloned.messages = messages;
        if (system) {
          cloned.system = (cloned.system ? cloned.system + "\n\n" : "") + system;
        }
      }
      if (cloned.tools) {
        cloned.tools = this.translateToolsToAnthropic(cloned.tools);
      }
    }

    return cloned;
  }

  // --- Streaming SSE Event Translation ---

  translateOpenAIToAnthropicChunk(openaiChunk) {
    try {
      const data = typeof openaiChunk === "string" ? JSON.parse(openaiChunk) : openaiChunk;
      const delta = data.choices && data.choices[0] && data.choices[0].delta;
      if (!delta) return null;

      if (delta.content) {
        return {
          type: "content_block_delta",
          index: 0,
          delta: {
            type: "text_delta",
            text: delta.content
          }
        };
      }

      if (delta.tool_calls && delta.tool_calls.length > 0) {
        const tc = delta.tool_calls[0];
        return {
          type: "content_block_start",
          index: 1,
          content_block: {
            type: "tool_use",
            id: tc.id || "call_stream",
            name: tc.function ? tc.function.name : "",
            input: {}
          }
        };
      }
    } catch (_) {}
    return null;
  }

  translateAnthropicToOpenAIChunk(anthropicChunk) {
    try {
      const data = typeof anthropicChunk === "string" ? JSON.parse(anthropicChunk) : anthropicChunk;
      if (data.type === "content_block_delta" && data.delta && data.delta.type === "text_delta") {
        return {
          choices: [{
            index: 0,
            delta: { content: data.delta.text },
            finish_reason: null
          }]
        };
      }
      if (data.type === "message_stop") {
        return {
          choices: [{
            index: 0,
            delta: {},
            finish_reason: "stop"
          }]
        };
      }
    } catch (_) {}
    return null;
  }
}

const defaultAgentClientManager = new AgentClientManager();

module.exports = {
  CLIENT_TYPES,
  CLIENT_COMPATIBILITY_MATRIX,
  AgentClientManager,
  defaultAgentClientManager
};
