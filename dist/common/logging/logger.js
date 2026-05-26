"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.logger = exports.appLogger = exports.Logger = exports.LogLevel = void 0;
// Enhanced Structured Logging
const pino_1 = __importDefault(require("pino"));
const env_1 = require("../../config/env");
// Log levels
var LogLevel;
(function (LogLevel) {
    LogLevel["TRACE"] = "trace";
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// Create logger instance
const logger = (0, pino_1.default)({
    level: env_1.env.LOG_LEVEL || 'info',
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
            code: err.code,
            statusCode: err.statusCode
        })
    },
    transport: env_1.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined
});
exports.logger = logger;
// Enhanced logger class
class Logger {
    constructor() {
        this.context = {};
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    // Set context for all subsequent logs
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    // Clear context
    clearContext() {
        this.context = {};
    }
    // Log methods with context
    trace(message, context) {
        logger.trace({ ...this.context, ...context }, message);
    }
    debug(message, context) {
        logger.debug({ ...this.context, ...context }, message);
    }
    info(message, context) {
        logger.info({ ...this.context, ...context }, message);
    }
    warn(message, context) {
        logger.warn({ ...this.context, ...context }, message);
    }
    error(message, context) {
        logger.error({ ...this.context, ...context }, message);
    }
    fatal(message, context) {
        logger.fatal({ ...this.context, ...context }, message);
    }
    // Business logic specific logging
    userAction(action, userId, details) {
        this.info(`User action: ${action}`, {
            userId,
            action,
            ...details
        });
    }
    apiCall(method, url, statusCode, responseTime, userId) {
        this.info('API call', {
            method,
            url,
            statusCode,
            responseTime,
            userId
        });
    }
    databaseQuery(query, duration, rowsAffected) {
        this.debug('Database query', {
            query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
            duration,
            rowsAffected
        });
    }
    securityEvent(event, details) {
        this.warn(`Security event: ${event}`, {
            event,
            ...details
        });
    }
    performanceMetric(metric, value, unit) {
        this.info(`Performance metric: ${metric}`, {
            metric,
            value,
            unit
        });
    }
}
exports.Logger = Logger;
// Export singleton instance
exports.appLogger = Logger.getInstance();
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Set request context
    exports.appLogger.setContext({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    // Log request
    exports.appLogger.info('Request started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        exports.appLogger.apiCall(req.method, req.url, res.statusCode, duration, req.user?.id);
        originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
