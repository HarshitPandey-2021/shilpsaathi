import { errorResponse, notFoundResponse } from '../utils/response.js';

export function notFoundHandler(req, res, next) {
  return notFoundResponse(res, `Route ${req.method} ${req.originalUrl} not found`);
}

export function globalErrorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 'Invalid JSON in request body', 400);
  }

  if (err.type === 'entity.too.large') {
    return errorResponse(res, 'Request payload too large', 413);
  }

  if (err.code === '23505') {
    return errorResponse(res, 'A record with this information already exists', 409);
  }

  if (err.code === '23503') {
    return errorResponse(res, 'Referenced record does not exist', 400);
  }

  const statusCode = err.statusCode || 500;
  return errorResponse(
    res,
    statusCode === 500 ? 'Internal server error' : err.message,
    statusCode,
    err
  );
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
