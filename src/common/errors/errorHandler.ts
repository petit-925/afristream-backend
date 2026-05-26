import type { NextFunction, Request, Response } from 'express';
import { AppError } from './AppError';
import { ErrorCode } from './types';
import { ErrorResponse } from './types';
import { logger } from '../../config/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Log the error
  logger.error({
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
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    // Handle different types of errors
    if (err.name === 'ValidationError') {
      statusCode = 400;
      errorCode = ErrorCode.VALIDATION_ERROR;
      message = 'Validation Error';
      details = err.message;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      errorCode = ErrorCode.INVALID_INPUT;
      message = 'Invalid input format';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      errorCode = ErrorCode.INVALID_TOKEN;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      errorCode = ErrorCode.TOKEN_EXPIRED;
      message = 'Token expired';
    } else if (err.name === 'MulterError') {
      statusCode = 400;
      errorCode = ErrorCode.UPLOAD_FAILED;
      message = 'File upload error';
      details = err.message;
    }
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
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

