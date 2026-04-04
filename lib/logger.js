/**
 * OPS-A1: Structured Logging Module
 * ═══════════════════════════════════
 * Lightweight custom logger — zero external dependencies.
 *
 * Features:
 *   - logger.info(), logger.warn(), logger.error(), logger.debug()
 *   - Each entry: { timestamp, level, message, ...context }
 *   - JSON format in production, pretty-printed in development
 *   - generateRequestId() for request tracing
 *
 * Usage:
 *   import { logger, generateRequestId } from './logger.js';
 *   const reqId = generateRequestId();
 *   logger.info('Webhook received', { reqId, phone: '***1234' });
 *
 * Sprint 3 will migrate existing console.log calls to use this module.
 *
 * شركة النخبوية للبرمجيات | Qatar University Advisor
 */

/* global process, crypto */

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

/** @enum {string} */
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO:  'info',
  WARN:  'warn',
  ERROR: 'error',
};

/** Numeric priority for level filtering */
const LEVEL_PRIORITY = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
};

// ──────────────────────────────────────────────────────────
// Environment detection
// ──────────────────────────────────────────────────────────

/**
 * Determine the current environment.
 * @returns {'production' | 'development' | 'test'}
 */
function getEnv() {
  return process.env.NODE_ENV || 'development';
}

/**
 * Determine the minimum log level from environment.
 * Production defaults to 'info', development to 'debug'.
 * Can be overridden via LOG_LEVEL env var.
 * @returns {string}
 */
function getMinLevel() {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  return getEnv() === 'production' ? 'info' : 'debug';
}

// ──────────────────────────────────────────────────────────
// Formatters
// ──────────────────────────────────────────────────────────

/**
 * Format a log entry as a JSON string (production format).
 * Flat structure for easy parsing by log aggregators (Vercel, Datadog, etc.).
 *
 * @param {string} level
 * @param {string} message
 * @param {object|undefined} context
 * @returns {string}
 */
function formatJSON(level, message, context) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && typeof context === 'object' && Object.keys(context).length > 0) {
    // Flatten context into the top-level entry for easier querying
    Object.assign(entry, context);
  }

  return JSON.stringify(entry);
}

/**
 * Format a log entry as a human-readable string (development format).
 *
 * Example output:
 *   [2026-04-04T12:00:00.000Z] INFO  Webhook received { reqId: 'abc123', phone: '***1234' }
 *
 * @param {string} level
 * @param {string} message
 * @param {object|undefined} context
 * @returns {string}
 */
function formatPretty(level, message, context) {
  const timestamp = new Date().toISOString();
  const levelTag = level.toUpperCase().padEnd(5);

  // Color codes for terminals that support them
  const colors = {
    debug: '\x1b[36m', // cyan
    info:  '\x1b[32m', // green
    warn:  '\x1b[33m', // yellow
    error: '\x1b[31m', // red
  };
  const reset = '\x1b[0m';
  const color = colors[level] || '';

  let line = `${color}[${timestamp}] ${levelTag}${reset} ${message}`;

  if (context && typeof context === 'object' && Object.keys(context).length > 0) {
    // Pretty-print context on the same line for quick scanning
    const contextStr = JSON.stringify(context, null, 0);
    line += ` ${color}${contextStr}${reset}`;
  }

  return line;
}

// ──────────────────────────────────────────────────────────
// Core logger
// ──────────────────────────────────────────────────────────

/**
 * Create a structured logger instance.
 * @returns {object} Logger with info, warn, error, debug methods
 */
function createLogger() {
  /**
   * Internal log dispatcher.
   * @param {string} level - One of LOG_LEVELS values
   * @param {string} message - Human-readable message
   * @param {object} [context] - Optional structured context data
   */
  function log(level, message, context) {
    const minLevel = getMinLevel();

    // Skip if below minimum level
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[minLevel]) {
      return;
    }

    const env = getEnv();
    const isProduction = env === 'production';
    const formatted = isProduction
      ? formatJSON(level, message, context)
      : formatPretty(level, message, context);

    // Route to the appropriate console method
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(formatted);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formatted);
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(formatted);
        break;
      case LOG_LEVELS.INFO:
      default:
        console.log(formatted);
        break;
    }
  }

  return {
    /**
     * Log an informational message.
     * @param {string} message
     * @param {object} [context]
     */
    info(message, context) {
      log(LOG_LEVELS.INFO, message, context);
    },

    /**
     * Log a warning message.
     * @param {string} message
     * @param {object} [context]
     */
    warn(message, context) {
      log(LOG_LEVELS.WARN, message, context);
    },

    /**
     * Log an error message.
     * Accepts an Error object in context.error — extracts message and stack.
     * @param {string} message
     * @param {object} [context]
     */
    error(message, context) {
      // If context contains an Error instance, extract useful fields
      if (context && context.error instanceof Error) {
        context = {
          ...context,
          error: undefined,
          errorMessage: context.error.message,
          errorStack: context.error.stack,
        };
      }
      log(LOG_LEVELS.ERROR, message, context);
    },

    /**
     * Log a debug message (suppressed in production by default).
     * @param {string} message
     * @param {object} [context]
     */
    debug(message, context) {
      log(LOG_LEVELS.DEBUG, message, context);
    },
  };
}

// ──────────────────────────────────────────────────────────
// Request ID generator
// ──────────────────────────────────────────────────────────

/**
 * Generate a short unique request ID for tracing.
 *
 * Format: `req_<8 hex chars>` (e.g., `req_a3f1b2c4`)
 * Provides ~4 billion unique IDs — sufficient for request tracing.
 *
 * Uses crypto.randomUUID() when available (Node 19+, Vercel Edge),
 * falls back to Math.random() for older environments.
 *
 * @returns {string} A short unique request identifier
 */
function generateRequestId() {
  // Try crypto.randomUUID (available in Node 19+, Vercel Edge, modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // Take first 8 chars of a UUID v4 — plenty of entropy for request tracing
    return `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
  }

  // Fallback: Math.random hex
  const hex = Math.random().toString(16).slice(2, 10).padEnd(8, '0');
  return `req_${hex}`;
}

// ──────────────────────────────────────────────────────────
// Singleton export
// ──────────────────────────────────────────────────────────

/** Singleton logger instance */
const logger = createLogger();

export { logger, generateRequestId, LOG_LEVELS };
