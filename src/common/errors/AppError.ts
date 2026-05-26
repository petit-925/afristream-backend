import { ErrorCode } from './types';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  // ✅ Add missing Bad Request factory method
  static badRequest(message: string = 'Bad request', details?: any): AppError {
    return new AppError(ErrorCode.BAD_REQUEST, message, 400, details);
  }

  // Static factory methods for common errors
  static unauthorized(message: string = 'Unauthorized access', details?: any): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401, details);
  }

  static forbidden(message: string = 'Access forbidden', details?: any): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403, details);
  }

  static notFound(resource: string = 'Resource', details?: any): AppError {
    return new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404, details);
  }

  static validation(message: string = 'Validation failed', details?: any): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }

  static conflict(message: string = 'Resource conflict', details?: any): AppError {
    return new AppError(ErrorCode.CONFLICT, message, 409, details);
  }

  static database(message: string = 'Database error', details?: any): AppError {
    return new AppError(ErrorCode.DATABASE_ERROR, message, 500, details);
  }

  static internal(message: string = 'Internal server error', details?: any): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500, details);
  }

  static fileUpload(message: string = 'File upload failed', details?: any): AppError {
    return new AppError(ErrorCode.UPLOAD_FAILED, message, 400, details);
  }

  static externalService(service: string, details?: any): AppError {
    return new AppError(
      ErrorCode.EXTERNAL_SERVICE_ERROR, 
      `External service error: ${service}`, 
      502, 
      details
    );
  }
}
