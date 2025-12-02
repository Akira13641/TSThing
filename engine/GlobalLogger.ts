/**
 * Global Logger System for Aetherial Vanguard
 * @fileoverview Provides centralized logging functionality with visual and console output
 */

import { LogLevel, LogSource } from '../types';

/**
 * Logger configuration interface
 */
interface LoggerConfig {
  /** Whether to output to visual console */
  visualLogging: boolean;
  /** Whether to output to browser console */
  consoleLogging: boolean;
  /** Current log level threshold */
  logLevel: LogLevel;
  /** Whether to use verbose mode */
  verboseMode: boolean;
}

/**
 * Log entry interface for structured logging
 */
interface LogEntry {
  /** Timestamp of the log entry */
  timestamp: number;
  /** Log level */
  level: LogLevel;
  /** Source system */
  source: LogSource;
  /** Log message */
  message: string;
  /** Additional data object */
  data?: unknown;
}

/**
 * Global Logger class providing centralized logging functionality
 * Supports both visual on-screen logging and browser console output
 */
export class GlobalLogger {
  /** Singleton instance */
  private static instance: GlobalLogger;
  
  /** Logger configuration */
  private config: LoggerConfig = {
    visualLogging: true,
    consoleLogging: true,
    logLevel: LogLevel.INFO,
    verboseMode: false
  };

  /** Array of log entries for visual display */
  private logEntries: LogEntry[] = [];
  
  /** Maximum number of entries to keep in memory */
  private maxEntries: number = 1000;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Gets the singleton instance of GlobalLogger
   * @returns The GlobalLogger instance
   */
  public static getInstance(): GlobalLogger {
    if (!GlobalLogger.instance) {
      GlobalLogger.instance = new GlobalLogger();
    }
    return GlobalLogger.instance;
  }

  /**
   * Resets the singleton instance (for testing purposes)
   */
  public static resetInstance(): void {
    GlobalLogger.instance = new GlobalLogger();
  }

  /**
   * Sets the logger configuration
   * @param config - New configuration values
   */
  public setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current logger configuration
   * @returns Current configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Logs a debug message
   * @param source - Source system
   * @param message - Log message
   * @param data - Optional additional data
   */
  public debug(source: LogSource, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, source, message, data);
  }

  /**
   * Logs an info message
   * @param source - Source system
   * @param message - Log message
   * @param data - Optional additional data
   */
  public info(source: LogSource, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, source, message, data);
  }

  /**
   * Logs a warning message
   * @param source - Source system
   * @param message - Log message
   * @param data - Optional additional data
   */
  public warn(source: LogSource, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, source, message, data);
  }

  /**
   * Logs an error message
   * @param source - Source system
   * @param message - Log message
   * @param data - Optional additional data
   */
  public error(source: LogSource, message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, source, message, data);
  }

  /**
   * Logs a fatal error message
   * @param source - Source system
   * @param message - Log message
   * @param data - Optional additional data
   */
  public fatal(source: LogSource, message: string, data?: unknown): void {
    this.log(LogLevel.FATAL, source, message, data);
  }

  /**
   * Core logging method
   * @param level - Log level
   * @param source - Source system
   * @param message - Log message
   * @param data - Optional additional data
   */
  private log(level: LogLevel, source: LogSource, message: string, data?: unknown): void {
    // Skip if below log level threshold
    if (level < this.config.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      source,
      message,
      data
    };

    // Add to log entries
    this.logEntries.push(entry);
    
    // Trim entries if exceeding max
    if (this.logEntries.length > this.maxEntries) {
      this.logEntries.shift();
    }

    // Console output
    if (this.config.consoleLogging) {
      this.outputToConsole(entry);
    }

    // Visual output (handled by React component)
    if (this.config.visualLogging) {
      // The visual component will read from getLogEntries()
      this.notifyVisualUpdate();
    }
  }

  /**
   * Outputs log entry to browser console
   * @param entry - Log entry to output
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.source}]`;

    const message = this.config.verboseMode 
      ? `${prefix} ${entry.message}` 
      : `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.data || '');
        break;
    }
  }

  /**
   * Notifies visual components of log updates
   * In a real implementation, this could use an event emitter or React context
   */
  private notifyVisualUpdate(): void {
    // This would typically trigger a re-render in a React component
    // For now, we'll rely on the component polling for updates
    if (typeof window !== 'undefined' && (window as any).loggerUpdateCallback) {
      (window as any).loggerUpdateCallback();
    }
  }

  /**
   * Gets all log entries for visual display
   * @param maxEntries - Maximum number of entries to return
   * @returns Array of log entries
   */
  public getLogEntries(maxEntries?: number): LogEntry[] {
    const entries = [...this.logEntries];
    return maxEntries ? entries.slice(-maxEntries) : entries;
  }

  /**
   * Gets log entries filtered by level
   * @param level - Log level to filter by
   * @returns Filtered log entries
   */
  public getLogEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.logEntries.filter(entry => entry.level === level);
  }

  /**
   * Gets log entries filtered by source
   * @param source - Source system to filter by
   * @returns Filtered log entries
   */
  public getLogEntriesBySource(source: LogSource): LogEntry[] {
    return this.logEntries.filter(entry => entry.source === source);
  }

  /**
   * Clears all log entries
   */
  public clearLogs(): void {
    this.logEntries = [];
    this.notifyVisualUpdate();
  }

  /**
   * Exports logs as JSON string
   * @returns JSON string of all log entries
   */
  public exportLogs(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }

  /**
   * Gets log statistics
   * @returns Object with log statistics
   */
  public getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    bySource: Record<string, number>;
  } {
    const stats = {
      total: this.logEntries.length,
      byLevel: {} as Record<string, number>,
      bySource: {} as Record<string, number>
    };

    this.logEntries.forEach(entry => {
      const levelName = LogLevel[entry.level];
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;
      stats.bySource[entry.source] = (stats.bySource[entry.source] || 0) + 1;
    });

    return stats;
  }

  /**
   * Toggles visual logging on/off
   */
  public toggleVisualLogging(): void {
    this.config.visualLogging = !this.config.visualLogging;
  }

  /**
   * Toggles console logging on/off
   */
  public toggleConsoleLogging(): void {
    this.config.consoleLogging = !this.config.consoleLogging;
  }

  /**
   * Toggles verbose mode on/off
   */
  public toggleVerboseMode(): void {
    this.config.verboseMode = !this.config.verboseMode;
  }

  /**
   * Sets the log level threshold
   * @param level - New log level threshold
   */
  public setLogLevel(level: LogLevel): void {
    this.config.logLevel = level;
  }

  /**
   * Gets the current log level
   * @returns Current log level
   */
  public getLogLevel(): LogLevel {
    return this.config.logLevel;
  }
}

/**
 * Export singleton instance for convenient usage
 */
export const logger = GlobalLogger.getInstance();

/**
 * Re-export LogSource for convenience
 */
export { LogSource } from '../types';