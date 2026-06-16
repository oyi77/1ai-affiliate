/**
 * Jest Setup File
 * Runs before all tests to configure mock environment and suppress logs
 */

// Suppress console output during tests unless explicitly needed
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test_user';
process.env.DB_PASS = 'test_pass';
process.env.DB_NAME = 'test_db';
process.env.POSTBACK_TIMEOUT = '5000';
process.env.POSTBACK_RETRIES = '3';

// Set up global test timeout
jest.setTimeout(10000);
const { resetRateLimit, resetAuthRateLimit, resetTier } = require('../middleware/rateLimit');

beforeEach(() => {
  resetRateLimit();
  resetAuthRateLimit();
  resetTier('write');
  resetTier('postback');
  resetTier('ai');
  resetTier('read');
});
