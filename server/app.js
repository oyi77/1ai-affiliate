require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const path = require('path');
const crypto = require('crypto');
const pool = require('./db/mysql');
const logger = require('./logger');
const metrics = require('./metrics');
const { idempotency } = require('./middleware/idempotency');
const { auditLog } = require('./middleware/auditLog');

const app = express();
const PORT = process.env.PORT || 3001;

// Security + observability middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger, genReqId: req => req.get('X-Request-ID') || crypto.randomUUID() }));

// Idempotency for mutating requests
app.use(idempotency());

// Mutation audit logging
app.use(auditLog());

// Metrics endpoint (public for load-balancer probes)
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics.getMetrics());
});

// Request/response counting
app.use((req, res, next) => {
  const routeKey = `${req.method} ${req.route?.path || req.path}`;
  metrics.incrementRequest(routeKey);
  const originalSend = res.send.bind(res);
  res.send = (body) => {
    metrics.incrementResponseStatus(res.statusCode, routeKey);
    return originalSend(body);
  };
  next();
});

// Static files — shared with PHP public dir
app.use(express.static(path.join(__dirname, 'public')));

// API documentation
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/om', require('./routes/om'));
app.use('/api/am', require('./routes/am'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/content', require('./routes/content'));
app.use('/api/geo', require('./routes/geoip'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/docs', require('./routes/docs'));
app.use('/api/smartlink', require('./routes/smartlink'));
app.use('/api', require('./routes/postback'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin/stats', require('./routes/statsSSE'));
app.use('/api/poster', require('./routes/poster'));
app.use('/api/pipeline', require('./routes/pipeline'));
// Shortlink / ClickServer (modern b202 equivalent)
app.get('/go/:hash', require('./controllers/smartlinkController').routeTrafficByHash);
// Health check — deep probe: checks DB connectivity + queue status
app.get('/health', async (req, res) => {
  const checks = { status: 'ok', service: '1ai-affiliate-tracker', port: String(PORT), timestamp: new Date().toISOString(), uptime: Math.floor(process.uptime()), request_id: req.id, components: {} };
  // DB check
  try {
    await pool.query('SELECT 1 AS ok');
    checks.components.database = { status: 'ok' };
  } catch (err) {
    checks.components.database = { status: 'degraded', error: err.message };
    checks.status = 'degraded';
  }
  // Queue check
  try {
    const [queueRows] = await pool.query("SELECT COUNT(*) AS pending FROM 1ai_postback_queue WHERE status IN ('queued', 'retry')");
    checks.components.queue = { status: 'ok', pending: queueRows[0]?.pending ?? 0 };
  } catch (err) {
    checks.components.queue = { status: 'not_configured' };
  }
  const httpStatus = checks.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(checks);
});

// SPA fallback — / serves admin SPA, /admin and /client alias
app.get('/admin', (req, res) => res.redirect('/admin/'));
app.get('/client', (req, res) => res.redirect('/client/'));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});
app.get('/client/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/client/index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// Error handler — log via pino, return request_id for 500s
app.use((err, req, res, next) => {
  const requestId = req.id || 'unknown';
  logger.error({ err, requestId }, 'Unhandled error');
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  const body = status >= 500
    ? { error: 'Internal server error', request_id: requestId }
    : { error: err.message || 'Error' };
  res.status(status).json(body);
});

if (require.main === module) {
  const postbackQueue = require('./services/postbackQueue');
  const posterWorker = require('./services/posterWorker');
  const pipelineWorker = require('./services/pipelineWorker');
  postbackQueue.start();
  posterWorker.start();
  pipelineWorker.start();
  app.listen(PORT, () => {
    logger.info(`1AI Affiliate Tracker server on port ${PORT}`);
    logger.info(`Shared MySQL: ${process.env.DB_NAME || '1ai-affiliate'}`);
  });
}

module.exports = app;
