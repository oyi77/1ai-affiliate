require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files — shared with PHP public dir
app.use(express.static(path.join(__dirname, 'public')));

// API documentation
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
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

const postbackQueue = require('./services/postbackQueue');
const posterWorker = require('./services/posterWorker');
const pipelineWorker = require('./services/pipelineWorker');

// Health check — deep probe: checks DB connectivity + queue status
app.get('/health', async (req, res) => {
  const checks = { status: 'ok', service: '1ai-affiliate-tracker', port: String(PORT), timestamp: new Date().toISOString(), uptime: Math.floor(process.uptime()), components: {} };
  // DB check
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    checks.components.database = { status: 'ok', latency_ms: 0 };
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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  postbackQueue.start();
  posterWorker.start();
  pipelineWorker.start();
  app.listen(PORT, () => {
    console.log(`1AI Affiliate Tracker server on port ${PORT}`);
    console.log(`Shared MySQL: ${process.env.DB_NAME || 'Prosper1ai'}`);
  });
}

module.exports = app;
