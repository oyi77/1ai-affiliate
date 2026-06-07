/**
 * Mock MySQL2/Promise Pool for Jest Testing
 * Allows complete control over query responses and error simulation
 */

const mockPool = {
  query: jest.fn(),
  end: jest.fn().mockResolvedValue(undefined),
  getConnection: jest.fn(),
};

module.exports = mockPool;
