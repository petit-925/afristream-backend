"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("./AppError");
const types_1 = require("./types");
const logger_1 = require("../../config/logger");
function errorHandler(err, req, res, _next) {
    // Log the error
    logger_1.logger.error({
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    // Don't send error response if headers already sent
    if (res.headersSent) {
        return;
    }
    let statusCode = 500;
    let errorCode = types_1.ErrorCode.INTERNAL_ERROR;
    let message = 'Internal Server Error';
    let details = undefined;
    // Handle AppError instances
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        errorCode = err.code;
        message = err.message;
        details = err.details;
    }
    else if (err instanceof Error) {
        // Handle different types of errors
        if (err.name === 'ValidationError') {
            statusCode = 400;
            errorCode = types_1.ErrorCode.VALIDATION_ERROR;
            message = 'Validation Error';
            details = err.message;
        }
        else if (err.name === 'CastError') {
            statusCode = 400;
            errorCode = types_1.ErrorCode.INVALID_INPUT;
            message = 'Invalid input format';
        }
        else if (err.name === 'JsonWebTokenError') {
            statusCode = 401;
            errorCode = types_1.ErrorCode.INVALID_TOKEN;
            message = 'Invalid token';
        }
        else if (err.name === 'TokenExpiredError') {
            statusCode = 401;
            errorCode = types_1.ErrorCode.TOKEN_EXPIRED;
            message = 'Token expired';
        }
        else if (err.name === 'MulterError') {
            statusCode = 400;
            errorCode = types_1.ErrorCode.UPLOAD_FAILED;
            message = 'File upload error';
            details = err.message;
        }
    }
    // Prepare error response
    const errorResponse = {
        success: false,
        error: {
            code: errorCode,
            message,
            details: process.env.NODE_ENV === 'development' ? details : undefined,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            statusCode
        }
    };
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && err instanceof Error && err.stack) {
        errorResponse.error.details = {
            ...errorResponse.error.details,
            stack: err.stack
        };
    }
    res.status(statusCode).json(errorResponse);
}
