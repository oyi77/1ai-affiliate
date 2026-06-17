import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Browser environment simulation
    environment: 'jsdom',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'node_modules',
        'src/**/*.d.ts',
        'src/**/*.test.js',
        'src/**/*.spec.js',
        'src/types/**',
        '**/*.config.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      all: true,
    },
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'tests/unit/**/*.{test,spec}.{js,ts}',
    ],
    
    // Setup file for global test configuration (to be created in separate task)
    // setupFiles: ['./src/test/setup.js'],
    
    // Global test timeout
    testTimeout: 10000,
  },
})
