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
const postbackQueue = require('./services/postbackQueue');
const posterWorker = require('./services/posterWorker');
const pipelineWorker = require('./services/pipelineWorker');
const cron = require('node-cron');
const { sendDailySummaryForAllUsers } = require('./cron/telegramDailySummary');

const app = express();
const PORT = process.env.PORT || 3001;

// Security + observability middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://static.cloudflareinsights.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:"],
      frameSrc: ["'self'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
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


// React SPA assets (built by Vite to public/dist/)
app.use(express.static(path.join(__dirname, 'public', 'dist')));
// API documentation
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/advertisers', require('./routes/advertisers'));
app.use('/api/admin/traffic-sources', require('./routes/trafficSources'));
app.use('/api/admin/offers', require('./routes/offers'));
app.use('/api/admin/campaigns', require('./routes/campaigns'));
app.use('/api/admin/reports', require('./routes/reports'));
app.use('/api/admin/affiliates', require('./routes/affiliates'));
app.use('/api/om', require('./routes/om'));
app.use('/api/am', require('./routes/am'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/content', require('./routes/content'));
app.use('/api/geo', require('./routes/geoip'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/docs', require('./routes/docs'));
app.use('/api/smartlink', require('./routes/smartlink'));
app.use('/api', require('./routes/postback'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/enterprise', require('./routes/enterprise'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin/stats', require('./routes/statsSSE'));
app.use('/api/poster', require('./routes/poster'));
app.use('/api/pipeline', require('./routes/pipeline'));
app.use('/api/affiliate', require('./routes/affiliate'));
app.use('/api/settings/telegram', require('./routes/telegram'));
app.use('/api/settings/payouts', require('./routes/payouts'));
app.use('/api/admin/notifications', require('./routes/notifications'));
app.use('/api/admin/taglinks', require('./routes/taglinks'));
app.use('/api/admin/shopee-accounts', require('./routes/shopeeAccounts'));
app.use('/api/admin/balance', require('./routes/balance'));
app.use('/api/admin/automation', require('./routes/automation'));
app.use('/api/admin/traffic-rules', require('./routes/trafficRules'));
app.use('/api/admin/webhooks', require('./routes/webhooks'));
app.use('/api/admin/payouts', require('./routes/payouts'));
// Honeypot trap — invisible link that only bots follow
app.get('/go/honeypot/:campaignId', require('./services/fraudRuleEngine').honeypotHandler);
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

// Legacy admin SPA (preserved for reference; React SPA serves root /)
app.get('/legacy/admin', (req, res) => res.redirect('/legacy/admin/'));
app.get('/legacy/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});
app.get('/legacy/client', (req, res) => res.redirect('/legacy/client/'));
app.get('/legacy/client/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/client/index.html'));
});

// React frontend SPA — catch-all for client-side routing (must be last)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/go/') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
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
  postbackQueue.start();
  posterWorker.start();
  pipelineWorker.start();
  // Telegram daily summary cron — 08:00 WIB (01:00 UTC)
  cron.schedule('0 1 * * *', () => {
    logger.info('[cron] Running Telegram daily summary...');
    sendDailySummaryForAllUsers(pool).catch(err => {
      logger.error({ err }, '[cron] Telegram daily summary failed');
    });
  });
  // Auto-sync ad platform stats daily at 06:00 UTC
  cron.schedule('0 6 * * *', () => {
    logger.info('[cron] Auto-syncing traffic source stats...');
    const { syncAllTrafficSources } = require('./services/autoSyncService');
    syncAllTrafficSources().then(r => logger.info({ synced: r.synced, errors: r.errors.length }, '[cron] Auto-sync done')).catch(err => logger.error({ err }, '[cron] Auto-sync failed'));
  });
  // Campaign auto-rules — evaluate every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    const { evaluateCampaignRules } = require('./services/campaignAutoRules');
    evaluateCampaignRules().catch(err => logger.error({ err }, '[cron] Campaign auto-rules failed'));
  });
  // Scheduled report exports — daily at 07:00 UTC
  cron.schedule('0 7 * * *', () => {
    const { runScheduledExports } = require('./services/scheduledExportService');
    runScheduledExports().catch(err => logger.error({ err }, '[cron] Scheduled exports failed'));
  });
  const server = app.listen(PORT, () => {
    logger.info(`1AI Affiliate Tracker server on port ${PORT}`);
    logger.info(`Shared MySQL: ${process.env.DB_NAME || '1ai-affiliate'}`);
  });

  function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      pool.end().then(() => {
        logger.info('Database pool closed.');
        process.exit(0);
      }).catch(() => process.exit(1));
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
