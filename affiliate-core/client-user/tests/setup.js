import { vi } from 'vitest';

// Setup jsdom environment for DOM testing
const setupJsdom = () => {
  if (typeof window !== 'undefined' && !window.document) {
    // jsdom is already setup by Vitest when using testEnvironment: 'jsdom'
    console.log('jsdom environment ready');
  }
};

// Global test timeout
vi.setConfig({
  testTimeout: 10000,
});

// Mock global objects if needed
beforeAll(() => {
  setupJsdom();
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// Global utilities available in all tests
global.testUtils = {
  createMockElement: (id) => ({
    id,
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
    },
    style: {},
    textContent: '',
    innerHTML: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
  
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};
