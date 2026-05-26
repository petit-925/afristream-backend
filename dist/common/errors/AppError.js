"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const types_1 = require("./types");
class AppError extends Error {
    constructor(code, message, statusCode = 500, details, isOperational = true) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = isOperational;
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    // ✅ Add missing Bad Request factory method
    static badRequest(message = 'Bad request', details) {
        return new AppError(types_1.ErrorCode.BAD_REQUEST, message, 400, details);
    }
    // Static factory methods for common errors
    static unauthorized(message = 'Unauthorized access', details) {
        return new AppError(types_1.ErrorCode.UNAUTHORIZED, message, 401, details);
    }
    static forbidden(message = 'Access forbidden', details) {
        return new AppError(types_1.ErrorCode.FORBIDDEN, message, 403, details);
    }
    static notFound(resource = 'Resource', details) {
        return new AppError(types_1.ErrorCode.NOT_FOUND, `${resource} not found`, 404, details);
    }
    static validation(message = 'Validation failed', details) {
        return new AppError(types_1.ErrorCode.VALIDATION_ERROR, message, 400, details);
    }
    static conflict(message = 'Resource conflict', details) {
        return new AppError(types_1.ErrorCode.CONFLICT, message, 409, details);
    }
    static database(message = 'Database error', details) {
        return new AppError(types_1.ErrorCode.DATABASE_ERROR, message, 500, details);
    }
    static internal(message = 'Internal server error', details) {
        return new AppError(types_1.ErrorCode.INTERNAL_ERROR, message, 500, details);
    }
    static fileUpload(message = 'File upload failed', details) {
        return new AppError(types_1.ErrorCode.UPLOAD_FAILED, message, 400, details);
    }
    static externalService(service, details) {
        return new AppError(types_1.ErrorCode.EXTERNAL_SERVICE_ERROR, `External service error: ${service}`, 502, details);
    }
}
exports.AppError = AppError;
