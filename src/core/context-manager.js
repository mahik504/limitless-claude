/**
 * Limitless Claude 8.0 - Context Intelligence & Compaction Manager
 * 
 * Manages conversation token budgeting and intelligent context compaction:
 * - Real-time token usage estimation across messages and tool calls
 * - Sliding-window compaction preserving essential tool state and objectives
 * - Truncation of verbose command output while preserving active decisions
 * - Context threshold warnings before upstream overflow occurs
 */

class ContextManager {
  constructor(options = {}) {
    this.defaultMaxTokens = options.defaultMaxTokens || 128_000;
    this.warningThreshold = options.warningThreshold || 0.80; // 80%
    this.maxToolOutputChars = options.maxToolOutputChars || 600;
  }

  // Fast, conservative token estimation (~3.8 characters per token)
  estimateTokens(payload) {
    if (!payload) return 0;
    let text = "";

    if (typeof payload === "string") {
      text = payload;
    } else if (Array.isArray(payload)) {
      for (const msg of payload) {
        if (typeof msg.content === "string") {
          text += msg.content;
        } else if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            text += block.text || "";
            if (block.input) text += JSON.stringify(block.input);
            if (block.content) text += typeof block.content === "string" ? block.content : JSON.stringify(block.content);
          }
        }
        if (msg.tool_calls) {
          text += JSON.stringify(msg.tool_calls);
        }
      }
    } else if (typeof payload === "object") {
      text = JSON.stringify(payload);
    }

    return Math.ceil(text.length / 3.8);
  }

  isNearLimit(messages = [], maxTokens = this.defaultMaxTokens) {
    const tokens = this.estimateTokens(messages);
    const ratio = tokens / maxTokens;
    return {
      currentTokens: tokens,
      maxTokens,
      ratio: parseFloat(ratio.toFixed(3)),
      isWarning: ratio >= this.warningThreshold,
      isCritical: ratio >= 0.95
    };
  }

  compactContext(messages = [], options = {}) {
    const maxTokens = options.maxTokens || this.defaultMaxTokens;
    const preserveRecentTurns = options.preserveRecentTurns || 4;

    const currentTokens = this.estimateTokens(messages);
    if (currentTokens <= maxTokens * this.warningThreshold) {
      return {
        compacted: false,
        tokensBefore: currentTokens,
        tokensAfter: currentTokens,
        messages
      };
    }

    const cloned = JSON.parse(JSON.stringify(messages));
    if (cloned.length <= preserveRecentTurns + 2) {
      return {
        compacted: false,
        tokensBefore: currentTokens,
        tokensAfter: currentTokens,
        messages: cloned
      };
    }

    // Keep:
    // 1. Initial user request (index 0 or after system)
    // 2. Recent N turns
    // Intermediate turns: compress verbose tool output and repetitive responses
    const splitIndex = cloned.length - preserveRecentTurns;

    for (let i = 1; i < splitIndex; i++) {
      const msg = cloned[i];

      // Compress OpenAI-style tool results
      if (msg.role === "tool" && typeof msg.content === "string" && msg.content.length > this.maxToolOutputChars) {
        msg.content = `${msg.content.slice(0, 250)}\n... [Context Manager: ${msg.content.length - 350} chars summarized for efficiency] ...\n${msg.content.slice(-100)}`;
      }

      // Compress Anthropic-style tool_result blocks
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === "tool_result" && typeof block.content === "string" && block.content.length > this.maxToolOutputChars) {
            block.content = `${block.content.slice(0, 250)}\n... [Context Manager: output truncated] ...\n${block.content.slice(-100)}`;
          }
        }
      }
    }

    const tokensAfter = this.estimateTokens(cloned);

    return {
      compacted: true,
      tokensBefore: currentTokens,
      tokensAfter,
      savings: currentTokens - tokensAfter,
      messages: cloned
    };
  }
}

const defaultContextManager = new ContextManager();

module.exports = {
  ContextManager,
  defaultContextManager
};
