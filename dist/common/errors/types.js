"use strict";
// Standardized Error Types and Interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    // Authentication & Authorization
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["INVALID_TOKEN"] = "INVALID_TOKEN";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    // Validation
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    // Resource Management
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    ErrorCode["CONFLICT"] = "CONFLICT";
    // Database
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["CONNECTION_ERROR"] = "CONNECTION_ERROR";
    // File Operations
    ErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    ErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    ErrorCode["INVALID_FILE_TYPE"] = "INVALID_FILE_TYPE";
    ErrorCode["UPLOAD_FAILED"] = "UPLOAD_FAILED";
    // External Services
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCode["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    // General
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Custom Application Errors  BAD_REQUEST = 'BAD_REQUEST',
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    ErrorCode["DEPENDENCY_FAILURE"] = "DEPENDENCY_FAILURE";
    ErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    ErrorCode["DEPRECATION"] = "DEPRECATION";
    ErrorCode["AUTHENTICATION_FAILED"] = "AUTHENTICATION_FAILED";
    ErrorCode["AUTHORIZATION_FAILED"] = "AUTHORIZATION_FAILED";
    ErrorCode["RESOURCE_LOCKED"] = "RESOURCE_LOCKED";
    ErrorCode["QUOTA_EXCEEDED"] = "QUOTA_EXCEEDED";
    ErrorCode["OPERATION_CANCELED"] = "OPERATION_CANCELED";
    ErrorCode["DATA_INTEGRITY_VIOLATION"] = "DATA_INTEGRITY_VIOLATION";
    ErrorCode["UNSUPPORTED_MEDIA_TYPE"] = "UNSUPPORTED_MEDIA_TYPE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
