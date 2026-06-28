const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const pool = require('./db/mysql');
const logger = require('./logger');
const metrics = require('./metrics');
const { idempotency } = require('./middleware/idempotency');
const { auditLog } = require('./middleware/auditLog');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security + observability middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://static.cloudflareinsights.com", "https://cdn.jsdelivr.net"],
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

// Global rate limiting + input sanitization
const { rateLimitGlobal } = require('./middleware/globalRateLimit');
const { sanitizeMiddleware } = require('./middleware/sanitizer');
app.use(rateLimitGlobal);
app.use(sanitizeMiddleware);

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
app.use(express.static(path.join(__dirname, 'public'), {
  index: false, // Don't serve index.html for / — let SPA catch-all handle it
  setHeaders: (res, filePath) => {
    if (/\.(html|js|css)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('CDN-Cache-Control', 'no-store');
    }
  }
}));
// React SPA assets — serve from dist/ so /assets/* resolves to dist/assets/*
app.use(express.static(path.join(__dirname, 'public/dist'), {
  index: false,
  setHeaders: (res, filePath) => {
    if (/\.(js|css)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('CDN-Cache-Control', 'no-store');
    }
  }
}));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/om', require('./routes/om'));
app.use('/api/am', require('./routes/am'));
// Payment routes (modern multi-gateway — legacy removed)
app.use('/api/content', require('./routes/content'));
app.use('/api/geo', require('./routes/geoip'));
// Public platform settings (no auth)
app.get('/api/platform/public', async (req, res) => {
  try {
    const pool = require('./db/mysql');
    const keys = ['brand_name', 'app_domain', 'support_email', 'default_currency', 'smartlink_domain'];
    const [rows] = await pool.query("SELECT name, value FROM 1ai_settings WHERE name IN (?)", [keys]);
    const settings = {};
    rows.forEach(r => { settings[r.name] = r.value; });
    res.json({ data: settings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use('/api/settings', require('./routes/settings'));
app.use('/api/docs', require('./routes/docs'));
app.use('/api/smartlink', require('./routes/smartlink'));
app.use('/api', require('./routes/postback'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin/stats', require('./routes/statsSSE'));
app.use('/api/poster', require('./routes/poster'));
app.use('/api/pipeline', require('./routes/pipeline'));
app.use('/api/admin', require('./routes/gapfill'));
app.use('/api/admin/services', require('./routes/services'));
app.use('/api/affiliate', require('./routes/content-integration'));
app.use('/api/templates/landing', require('./routes/landingTemplates'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/enterprise', require('./routes/enterprise'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/copilot', require('./routes/copilot'));
app.use('/api/2fa', require('./routes/twoFactor'));
app.use('/api/import-export', require('./routes/importExport'));
app.use('/api/admin/campaigns', require('./routes/campaigns'));
app.use('/api/admin/offers', require('./routes/offers'));
app.use('/api/admin/affiliates', require('./routes/affiliates'));
app.use('/api/migration', require('./routes/migration'));
app.use('/api/advertiser', require('./routes/advertiserSelfService'));
app.use('/api/offers', require('./routes/offerBrowser'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin/balance', require('./routes/balance'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin/finance', require('./routes/adminFinance'));
app.use('/api/boost', require('./routes/boost'));
// Auto-optimization cron (runs every 15 minutes)
const { runOptimization } = require('./services/autoOptimizer');
setInterval(() => {
  runOptimization().then(r => {
    if (r.actions.length > 0) console.log(`[AutoOptimize] ${r.actions.length} actions taken`);
  }).catch(e => console.error('[AutoOptimize] error:', e.message));
}, 15 * 60 * 1000);

// Real-time dashboard SSE
const { createSSEHandler } = require('./services/realtimeDashboard');
app.get('/api/admin/stats/stream', createSSEHandler(5000));

// Direct tracking pixel
const { handlePixelRequest } = require('./services/directTracking');
app.get('/pixel.gif', async (req, res) => {
  await handlePixelRequest(req.query);
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' });
  res.end(gif);
});

// Attribution API
const attributionService = require('./services/attributionService');
app.get('/api/attribution/report', authenticate, async (req, res) => {
  try {
    const report = await attributionService.getAttributionReport(req.query);
    res.json({ data: report });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Auto-optimization API
app.get('/api/admin/optimization/history', authenticate, async (req, res) => {
  try {
    const { getOptimizationHistory } = require('./services/autoOptimizer');
    res.json({ data: await getOptimizationHistory() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/admin/optimization/run', authenticate, async (req, res) => {
  try {
    res.json({ data: await runOptimization() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
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

// React SPA — serves dist/index.html for all non-API routes (client-side routing)
const spaHandler = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public/dist/index.html'), { cacheControl: false });
};
app.get('/', spaHandler);
// Catch-all middleware for React client-side routes (must use app.use, not app.get('*'))
app.use((req, res, next) => {
  // Only handle GET requests for HTML pages (not API, not static files)
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) return next();
  spaHandler(req, res);
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
