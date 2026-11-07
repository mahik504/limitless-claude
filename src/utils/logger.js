/**
 * Limitless Claude 7.0 - Redacting Structured Logger
 */

const { redactText, redactObject } = require("./redact");

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LIMITLESS_LOG_LEVEL || "info";
    this.prefix = options.prefix || "Limitless";
  }

  shouldLog(level) {
    const currentScore = LOG_LEVELS[this.level.toLowerCase()] ?? 1;
    const targetScore = LOG_LEVELS[level.toLowerCase()] ?? 1;
    return targetScore >= currentScore;
  }

  format(level, message, meta) {
    const timestamp = new Date().toISOString();
    const cleanMsg = typeof message === "string" ? redactText(message) : redactObject(message);
    const cleanMeta = meta !== undefined ? (typeof meta === "string" ? redactText(meta) : redactObject(meta)) : null;

    let levelStr = level.toUpperCase();
    if (process.stdout.isTTY) {
      if (level === "info") levelStr = `\x1b[36m${levelStr}\x1b[0m`;
      else if (level === "warn") levelStr = `\x1b[33m${levelStr}\x1b[0m`;
      else if (level === "error") levelStr = `\x1b[31m${levelStr}\x1b[0m`;
      else if (level === "debug") levelStr = `\x1b[90m${levelStr}\x1b[0m`;
    }

    let out = `[${timestamp}] [${this.prefix}] [${levelStr}] ${typeof cleanMsg === "object" ? JSON.stringify(cleanMsg) : cleanMsg}`;
    if (cleanMeta) {
      out += ` ${typeof cleanMeta === "object" ? JSON.stringify(cleanMeta) : cleanMeta}`;
    }
    return out;
  }

  info(msg, meta) {
    if (this.shouldLog("info")) console.log(this.format("info", msg, meta));
  }

  warn(msg, meta) {
    if (this.shouldLog("warn")) console.warn(this.format("warn", msg, meta));
  }

  error(msg, meta) {
    if (this.shouldLog("error")) console.error(this.format("error", msg, meta));
  }

  debug(msg, meta) {
    if (this.shouldLog("debug")) console.log(this.format("debug", msg, meta));
  }
}

const defaultLogger = new Logger();

module.exports = {
  Logger,
  logger: defaultLogger
};
