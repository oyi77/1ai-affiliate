'use strict';

/**
 * Secure Error Handler — never leaks stack traces to clients.
 */

function secureErrorHandler(err, req, res, _next) {
  // Log full error server-side
  const statusCode = err.statusCode || err.status || 500;
  const requestId = req.id || req.headers['x-request-id'] || 'unknown';
  
  console.error(JSON.stringify({
    level: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    path: req.path,
    method: req.method,
    requestId,
    statusCode,
    timestamp: new Date().toISOString(),
  }));

  // Return safe error to client
  const responseBody = {
    error: statusCode >= 500 ? 'Internal server error' : err.message,
    requestId,
  };

  // Only include validation details for 4xx errors
  if (statusCode < 500 && err.details) {
    responseBody.details = err.details;
  }

  res.status(statusCode).json(responseBody);
}

/**
 * Async wrapper — catches async errors and passes to error handler.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not Found handler.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', path: req.path });
}

module.exports = { secureErrorHandler, asyncHandler, notFoundHandler };
