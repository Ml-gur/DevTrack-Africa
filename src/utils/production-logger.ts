/**
 * Production-ready logging utility
 * Replaces console.log statements with environment-aware logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

class ProductionLogger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  constructor() {
    this.isDevelopment = this.checkDevelopmentMode();
  }

  private checkDevelopmentMode(): boolean {
    // Check multiple indicators for development mode
    try {
      // Check NODE_ENV
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        return true;
      }

      // Check if we're on localhost
      if (typeof window !== 'undefined') {
        const hostname = window.location?.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname?.includes('.local')) {
          return true;
        }
        
        // Check for development ports
        const port = window.location?.port;
        if (port === '5173' || port === '3000' || port === '8080') {
          return true;
        }
      }

      // Check Vite development mode
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  debug(message: string, data?: any) {
    this.addLog('debug', message, data);
    if (this.isDevelopment) {
      console.debug(`🔧 ${message}`, data ? data : '');
    }
  }

  info(message: string, data?: any) {
    this.addLog('info', message, data);
    if (this.isDevelopment) {
      console.info(`ℹ️ ${message}`, data ? data : '');
    }
  }

  warn(message: string, data?: any) {
    this.addLog('warn', message, data);
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, data ? data : '');
    }
    // In production, still show warnings but less verbose
    else {
      console.warn(message);
    }
  }

  error(message: string, error?: any) {
    this.addLog('error', message, error);
    // Always show errors, but format appropriately
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, error ? error : '');
    } else {
      console.error(message, error instanceof Error ? error.message : error);
      
      // In production, you might want to send errors to a monitoring service
      // this.sendToMonitoring(message, error);
    }
  }

  // Production-safe console methods
  production = {
    info: (message: string) => {
      // Only log important info in production
      console.info(message);
    },
    
    warn: (message: string) => {
      console.warn(message);
    },
    
    error: (message: string, error?: any) => {
      console.error(message, error);
    }
  };

  // Get recent logs (useful for debugging in production)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Method to send critical errors to monitoring service in production
  private sendToMonitoring(message: string, error: any) {
    // Placeholder for error monitoring integration
    // Example: Sentry, LogRocket, etc.
    if (!this.isDevelopment) {
      // Send to error monitoring service
      // Sentry.captureException(error, { extra: { message } });
    }
  }
}

// Create singleton instance
export const logger = new ProductionLogger();

// Export convenience methods
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger)
};

export default logger;