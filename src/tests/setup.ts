// Test Setup Configuration
import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { pool } from '../services/db';
import { AppError } from '../common/errors/AppError';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '3306'),
  user: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || '',
  database: process.env.TEST_DB_NAME || 'afristream_test',
  multipleStatements: true
};

// Test data cleanup
export const cleanupTestData = async () => {
  try {
    // Clean up test data in reverse dependency order
    await pool.query('DELETE FROM orders WHERE user_id > 1000');
    await pool.query('DELETE FROM testimonials WHERE user_id > 1000');
    await pool.query('DELETE FROM products WHERE user_id > 1000');
    await pool.query('DELETE FROM portfolio WHERE user_id > 1000');
    await pool.query('DELETE FROM blog_posts WHERE user_id > 1000');
    await pool.query('DELETE FROM users WHERE id > 1000');
    await pool.query('DELETE FROM categories WHERE id > 100');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
};

// Setup test environment
beforeAll(async () => {
  try {
    // Ensure test database exists
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${TEST_DB_CONFIG.database}`);
    await pool.query(`USE ${TEST_DB_CONFIG.database}`);
    
    // Run migrations or create tables
    // This would typically run your schema migrations
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

// Clean up after each test
beforeEach(async () => {
  await cleanupTestData();
});

// Clean up after all tests
afterAll(async () => {
  try {
    await cleanupTestData();
    await pool.end();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

// Test utilities
export const createTestUser = async (userData: any = {}) => {
  const defaultData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: '$2a$12$test.hash',
    role: 'client',
    status: 'active',
    ...userData
  };
  
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
    [defaultData.name, defaultData.email, defaultData.password, defaultData.role, defaultData.status]
  );
  
  return { id: (result as any).insertId, ...defaultData };
};

export const createTestProduct = async (productData: any = {}) => {
  const defaultData = {
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    stock: 10,
    status: 'active',
    user_id: 1,
    ...productData
  };
  
  const [result] = await pool.query(
    'INSERT INTO products (name, description, price, stock, status, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [defaultData.name, defaultData.description, defaultData.price, defaultData.stock, defaultData.status, defaultData.user_id]
  );
  
  return { id: (result as any).insertId, ...defaultData };
};

export const createTestCategory = async (categoryData: any = {}) => {
  const defaultData = {
    name: 'Test Category',
    description: 'Test category description',
    slug: `test-category-${Date.now()}`,
    is_active: true,
    ...categoryData
  };
  
  const [result] = await pool.query(
    'INSERT INTO categories (name, description, slug, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [defaultData.name, defaultData.description, defaultData.slug, defaultData.is_active]
  );
  
  return { id: (result as any).insertId, ...defaultData };
};

// Mock JWT token for testing
export const createMockToken = (payload: any = {}) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: 1, role: 'admin', email: 'test@example.com', ...payload },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Test request helper
export const createTestRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: { id: 1, role: 'admin', email: 'test@example.com' },
  ...overrides
});

// Test response helper
export const createTestResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
