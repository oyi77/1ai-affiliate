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

// Shortlink / ClickServer (modern b202 equivalent)
app.get('/go/:hash', require('./controllers/smartlinkController').routeTrafficByHash);

// Start postback queue processor
const postbackQueue = require('./services/postbackQueue');
postbackQueue.start();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: '1ai-affiliate-tracker', port: PORT });
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

app.listen(PORT, () => {
  console.log(`1AI Affiliate Tracker server on port ${PORT}`);
  console.log(`Shared MySQL: ${process.env.DB_NAME || 'Prosper1ai'}`);
});

module.exports = app;
