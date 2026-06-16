const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["x-api-key"]',
      'password',
      'req.body.password',
      'req.body.apiKey',
      'req.body.token',
      'res.body.token',
      '*.password',
      '*.apiKey',
      '*.secret',
    ],
    remove: true,
  },
});

module.exports = logger;

