const { z } = require('zod');

/**
 * Express middleware that validates req.body against a Zod schema.
 * On success, sets req.validated = parsed data and calls next().
 * On failure, returns 400 with validation details.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => {
        const path = i.path.length ? `${i.path.join('.')}: ` : '';
        return `${path}${i.message}`;
      });
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validate, z };
