// This file runs before all tests.
// We can mock global configurations or database connections here.

// Example: mocking the DB query method used in server.js health check
jest.mock('../src/config/db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 })
}));
