// Jest setup file for global test configuration

// Suppress console warnings during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // Uncomment to suppress console.warn during tests
  // warn: jest.fn(),
  // Keep console.error for debugging
  error: console.error,
};

// Mock environment variables for tests
process.env.NODE_ENV = 'test';

// Add custom jest matchers if needed
expect.extend({
  // Custom matchers can be added here
});
