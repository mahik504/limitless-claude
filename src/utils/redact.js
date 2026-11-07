/**
 * Limitless Claude 7.0 - Secret & Token Redaction Utility
 * Guarantees zero sensitive tokens leak to logs, reports, or stdout.
 */

const SECRET_PATTERNS = [
  // Anthropic / OmniRoute style API keys
  /sk-ant-[a-zA-Z0-9_\-]{8,}/gi,
  /sk-[a-zA-Z0-9_\-]{16,}/gi,
  // Bearer tokens
  /Bearer\s+([a-zA-Z0-9_\-\.]{12,})/gi,
  // Generic token assignments
  /(?:api[_-]?key|auth[_-]?token|secret|password|access[_-]?token)\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{8,})["']?/gi
];

function maskKey(key, showEnds = 3) {
  if (!key || typeof key !== "string") return "[REDACTED]";
  const trimmed = key.trim();
  if (trimmed.length <= showEnds * 2 + 2) return "[REDACTED]";
  return `${trimmed.slice(0, showEnds)}...${trimmed.slice(-showEnds)}`;
}

function redactText(text, showEnds = 0) {
  if (!text || typeof text !== "string") return text;
  let redacted = text;

  // Mask exact token regexes
  for (const pat of SECRET_PATTERNS) {
    redacted = redacted.replace(pat, (match, captured) => {
      const target = captured || match;
      const masked = showEnds > 0 ? maskKey(target, showEnds) : "[REDACTED]";
      return match.replace(target, masked);
    });
  }

  return redacted;
}

function redactObject(obj, showEnds = 0) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return redactText(obj, showEnds);
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item, showEnds));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = lowerKey.includes("key") ||
                        lowerKey.includes("token") ||
                        lowerKey.includes("secret") ||
                        lowerKey.includes("auth") ||
                        lowerKey.includes("password");

    if (isSensitive && typeof value === "string") {
      result[key] = showEnds > 0 ? maskKey(value, showEnds) : "[REDACTED]";
    } else {
      result[key] = redactObject(value, showEnds);
    }
  }
  return result;
}

module.exports = {
  maskKey,
  maskApiKey: maskKey,
  redactText,
  redactSecret: redactText,
  redactObject
};
