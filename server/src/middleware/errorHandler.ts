import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log full error on server side only for diagnostics
  console.error(`[API ERROR] ${req.method} ${req.originalUrl}:`, err.message || err);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected error occurred while processing your request.';
  let code = err.code || 'INTERNAL_ERROR';

  // Sanitize MongoDB duplicate key error
  if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists in the database.`;
    code = 'DUPLICATE_KEY';
  }

  // Sanitize Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format.';
    code = 'INVALID_ID';
  }

  // Sanitize Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors || {}).map((e: any) => e.message);
    message = messages.length > 0 ? messages.join(', ') : 'Validation error on submission.';
    code = 'VALIDATION_ERROR';
  }

  // Sanitize JWT verification errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired or is invalid. Please sign in again.';
    code = 'INVALID_TOKEN';
  }

  // Ensure internal details and stack traces are NEVER sent in response body
  return res.status(statusCode).json({
    success: false,
    message,
    code
  });
};
