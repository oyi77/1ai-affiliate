'use strict';

const Redis = require('ioredis');

let sharedClient = null;

function getConfig() {
  return {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

function buildClient(config = getConfig()) {
  return new Redis(config.url, {
    password: config.password,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });
}

async function connect(options = {}) {
  const createClient = options.createClient || (() => buildClient(getConfig()));
  const client = createClient();
  await client.connect();
  return client;
}

async function getClient() {
  if (!sharedClient) {
    sharedClient = await connect();
  }
  return sharedClient;
}

async function consume({ limiter, key, windowMs, max }) {
  const client = await getClient();
  const redisKey = `rate_limit:${limiter}:${key}`;
  const count = await client.incr(redisKey);

  if (count === 1) {
    await client.pexpire(redisKey, windowMs);
  }

  let ttlMs = await client.pttl(redisKey);
  if (ttlMs < 0) {
    ttlMs = windowMs;
    await client.pexpire(redisKey, windowMs);
  }

  const allowed = count <= max;
  const remaining = allowed ? Math.max(0, max - count) : 0;
  const retryAfter = Math.max(1, Math.ceil(ttlMs / 1000));

  return {
    allowed,
    remaining,
    retryAfter,
  };
}

async function resetForTests() {
  if (sharedClient && typeof sharedClient.quit === 'function') {
    await sharedClient.quit().catch(() => {});
  }
  sharedClient = null;
}

module.exports = {
  getConfig,
  buildClient,
  connect,
  consume,
  resetForTests,
};
