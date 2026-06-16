const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

// Same MySQL as PHP 1ai-config.php — shared user/affiliate tables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || '1ai_affiliate',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
