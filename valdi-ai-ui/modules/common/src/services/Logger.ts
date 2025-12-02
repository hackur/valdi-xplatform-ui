/**
 * Logger Service
 *
 * Production-ready logging service with configurable log levels and formatting.
 * Replaces direct console usage for better debugging and production monitoring.
 */

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  level?: LogLevel;

  /** Module/component name for log prefixes */
  module?: string;

  /** Enable timestamps */
  timestamps?: boolean;

  /** Custom log handler (for sending to monitoring service) */
  handler?: (level: LogLevel, message: string, data?: unknown) => void;
}

/**
 * Logger class for structured logging
 *
 * @example
 * ```typescript
 * const logger = new Logger({ module: 'ChatService', level: LogLevel.INFO });
 * logger.info('Message sent', { conversationId: '123' });
 * logger.error('Failed to send message', error);
 * ```
 */
export class Logger {
  private readonly config: Required<LoggerConfig>;
  private static globalLevel: LogLevel = LogLevel.INFO;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level ?? Logger.globalLevel,
      module: config.module ?? 'App',
      timestamps: config.timestamps ?? true,
      handler: config.handler ?? this.defaultHandler,
    };
  }

  /**
   * Set global log level for all loggers
   */
  static setGlobalLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  /**
   * Log debug message (verbose information)
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message (general information)
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message (potential issues)
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message (failures and exceptions)
   */
  error(message: string, error?: unknown): void {
    this.log(LogLevel.ERROR, message, error);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    // Check if log level meets threshold
    if (level < this.config.level) {
      return;
    }

    // Format message
    const formattedMessage = this.formatMessage(level, message);

    // Call handler
    this.config.handler(level, formattedMessage, data);
  }

  /**
   * Format log message with timestamp and module prefix
   */
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];

    // Add timestamp
    if (this.config.timestamps) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }

    // Add log level
    parts.push(`[${LogLevel[level]}]`);

    // Add module name
    parts.push(`[${this.config.module}]`);

    // Add message
    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Default handler - outputs to console
   */
  private readonly defaultHandler = (
    level: LogLevel,
    message: string,
    data?: unknown,
  ): void => {
    switch (level) {
      case LogLevel.DEBUG:
        if (data !== undefined) {
          console.debug(message, data);
        } else {
          console.debug(message);
        }
        break;

      case LogLevel.INFO:
        if (data !== undefined) {
          console.info(message, data);
        } else {
          console.info(message);
        }
        break;

      case LogLevel.WARN:
        if (data !== undefined) {
          console.warn(message, data);
        } else {
          console.warn(message);
        }
        break;

      case LogLevel.ERROR:
        if (data !== undefined) {
          console.error(message, data);
        } else {
          console.error(message);
        }
        break;
    }
  };

  /**
   * Create a child logger with the same config but different module name
   */
  createChild(module: string): Logger {
    return new Logger({
      ...this.config,
      module: `${this.config.module}:${module}`,
    });
  }
}

/**
 * Global logger instance for general use
 */
export const logger = new Logger({ module: 'Valdi' });

/**
 * Configure production logging
 * - Disables debug logs
 * - Can integrate with monitoring services
 */
export function configureProductionLogging(): void {
  Logger.setGlobalLevel(LogLevel.WARN);
}

/**
 * Configure development logging
 * - Enables all log levels
 * - Verbose output for debugging
 */
export function configureDevelopmentLogging(): void {
  Logger.setGlobalLevel(LogLevel.DEBUG);
}
