// Enhanced Structured Logging
import pino from 'pino';
import { env } from '../../config/env';

// Log levels
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Log context interface
export interface LogContext {
  userId?: number;
  requestId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  error?: Error;
  [key: string]: any;
}

// Create logger instance
const logger = pino({
  level: env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => {
      // Add timestamp if not present
      if (!object.time) {
        object.time = new Date().toISOString();
      }
      return object;
    }
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? '[REDACTED]' : undefined
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.headers
    }),
    err: (err) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
      code: (err as any).code,
      statusCode: (err as any).statusCode
    })
  },
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// Enhanced logger class
export class Logger {
  private static instance: Logger;
  private context: LogContext = {};

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Set context for all subsequent logs
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  // Clear context
  clearContext(): void {
    this.context = {};
  }

  // Log methods with context
  trace(message: string, context?: LogContext): void {
    logger.trace({ ...this.context, ...context }, message);
  }

  debug(message: string, context?: LogContext): void {
    logger.debug({ ...this.context, ...context }, message);
  }

  info(message: string, context?: LogContext): void {
    logger.info({ ...this.context, ...context }, message);
  }

  warn(message: string, context?: LogContext): void {
    logger.warn({ ...this.context, ...context }, message);
  }

  error(message: string, context?: LogContext): void {
    logger.error({ ...this.context, ...context }, message);
  }

  fatal(message: string, context?: LogContext): void {
    logger.fatal({ ...this.context, ...context }, message);
  }

  // Business logic specific logging
  userAction(action: string, userId: number, details?: any): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...details
    });
  }

  apiCall(method: string, url: string, statusCode: number, responseTime: number, userId?: number): void {
    this.info('API call', {
      method,
      url,
      statusCode,
      responseTime,
      userId
    });
  }

  databaseQuery(query: string, duration: number, rowsAffected?: number): void {
    this.debug('Database query', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration,
      rowsAffected
    });
  }

  securityEvent(event: string, details: any): void {
    this.warn(`Security event: ${event}`, {
      event,
      ...details
    });
  }

  performanceMetric(metric: string, value: number, unit: string): void {
    this.info(`Performance metric: ${metric}`, {
      metric,
      value,
      unit
    });
  }
}

// Export singleton instance
export const appLogger = Logger.getInstance();

// Export base logger for compatibility
export { logger };

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Set request context
  appLogger.setContext({
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Log request
  appLogger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const duration = Date.now() - start;
    
    appLogger.apiCall(
      req.method,
      req.url,
      res.statusCode,
      duration,
      (req as any).user?.id
    );

    originalEnd.call(this, chunk, encoding);
  };

  next();
};
