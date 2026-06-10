/**
 * Jest Configuration for 1ai-Affiliate Server Tests
 * Runs all tests matching the testMatch pattern with coverage reporting
 */

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/postbackController.js',
    'services/postbackQueue.js',
    'middleware/rateLimit.js',
    'agents/**/*.js',
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    'tests',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/public/'],
  verbose: true,
  bail: false,
  maxWorkers: '50%',
};
