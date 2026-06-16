const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const RETRYABLE_ERRORS = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ER_CON_COUNT_ERROR', 'PROTOCOL_CONNECTION_LOST'];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 250;

function createPoolConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || '1ai_affiliate',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 20,
    queueLimit: Number(process.env.DB_QUEUE_LIMIT) || 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };
}
let innerPool = mysql.createPool(createPoolConfig());

function isRetryable(err) {
  if (!err) return false;
  if (RETRYABLE_ERRORS.includes(err.code)) return true;
  if (err.message && /connection lost|server has gone away|too many connections|pool is closed/i.test(err.message)) return true;
  return false;
}
async function retryOnTransient(operation, retries = 0) {
  try {
    return await operation();
  } catch (err) {
    if (retries < MAX_RETRIES && isRetryable(err)) {
      if (/pool is closed/i.test(err.message)) {
        recreatePool();
      }
      await sleep(BASE_DELAY_MS * 2 ** retries);
      return retryOnTransient(operation, retries + 1);
    }
    throw err;
  }
}

async function queryWithRetry(sql, params) {
  return retryOnTransient(() => innerPool.query(sql, params));
}

async function executeWithRetry(sql, params) {
  return retryOnTransient(() => innerPool.execute(sql, params));
}

async function closePool() {
  if (innerPool) {
    await innerPool.end();
    innerPool = null;
  }
}

function recreatePool() {
  if (!innerPool) {
    innerPool = mysql.createPool(createPoolConfig());
  }
  return innerPool;
}

// Expose a proxy that forwards everything to the underlying mysql2 pool,
// but intercepts query/execute to add transient-failure retry.
const poolProxy = new Proxy(innerPool, {
  get(target, prop) {
    if (prop === 'query') return queryWithRetry;
    if (prop === 'execute') return executeWithRetry;
    if (prop === 'close') return closePool;
    if (prop === 'recreate') return recreatePool;
    if (prop === 'getPoolStatus') {
      return () => ({
        connectionLimit: createPoolConfig().connectionLimit,
        queueLimit: createPoolConfig().queueLimit,
      });
    }
    const value = target[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
});

module.exports = poolProxy;
