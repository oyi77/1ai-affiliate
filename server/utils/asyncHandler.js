/**
 * Wraps an async route handler so thrown errors are caught and returned
 * as proper JSON responses instead of crashing the process.
 *
 * Handles common MySQL duplicate entry errors automatically.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(`${fn.name || 'handler'} error:`, err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry' });
      }
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    });
  };
}

module.exports = { asyncHandler };
