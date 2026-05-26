"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestResponse = exports.createTestRequest = exports.createMockToken = exports.createTestCategory = exports.createTestProduct = exports.createTestUser = exports.cleanupTestData = void 0;
// Test Setup Configuration
const globals_1 = require("@jest/globals");
const db_1 = require("../services/db");
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
const cleanupTestData = async () => {
    try {
        // Clean up test data in reverse dependency order
        await db_1.pool.query('DELETE FROM orders WHERE user_id > 1000');
        await db_1.pool.query('DELETE FROM testimonials WHERE user_id > 1000');
        await db_1.pool.query('DELETE FROM products WHERE user_id > 1000');
        await db_1.pool.query('DELETE FROM portfolio WHERE user_id > 1000');
        await db_1.pool.query('DELETE FROM blog_posts WHERE user_id > 1000');
        await db_1.pool.query('DELETE FROM users WHERE id > 1000');
        await db_1.pool.query('DELETE FROM categories WHERE id > 100');
    }
    catch (error) {
        console.error('Error cleaning up test data:', error);
    }
};
exports.cleanupTestData = cleanupTestData;
// Setup test environment
(0, globals_1.beforeAll)(async () => {
    try {
        // Ensure test database exists
        await db_1.pool.query(`CREATE DATABASE IF NOT EXISTS ${TEST_DB_CONFIG.database}`);
        await db_1.pool.query(`USE ${TEST_DB_CONFIG.database}`);
        // Run migrations or create tables
        // This would typically run your schema migrations
        console.log('Test database setup complete');
    }
    catch (error) {
        console.error('Test setup failed:', error);
        throw error;
    }
});
// Clean up after each test
(0, globals_1.beforeEach)(async () => {
    await (0, exports.cleanupTestData)();
});
// Clean up after all tests
(0, globals_1.afterAll)(async () => {
    try {
        await (0, exports.cleanupTestData)();
        await db_1.pool.end();
    }
    catch (error) {
        console.error('Test cleanup failed:', error);
    }
});
// Test utilities
const createTestUser = async (userData = {}) => {
    const defaultData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: '$2a$12$test.hash',
        role: 'client',
        status: 'active',
        ...userData
    };
    const [result] = await db_1.pool.query('INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [defaultData.name, defaultData.email, defaultData.password, defaultData.role, defaultData.status]);
    return { id: result.insertId, ...defaultData };
};
exports.createTestUser = createTestUser;
const createTestProduct = async (productData = {}) => {
    const defaultData = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        stock: 10,
        status: 'active',
        user_id: 1,
        ...productData
    };
    const [result] = await db_1.pool.query('INSERT INTO products (name, description, price, stock, status, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', [defaultData.name, defaultData.description, defaultData.price, defaultData.stock, defaultData.status, defaultData.user_id]);
    return { id: result.insertId, ...defaultData };
};
exports.createTestProduct = createTestProduct;
const createTestCategory = async (categoryData = {}) => {
    const defaultData = {
        name: 'Test Category',
        description: 'Test category description',
        slug: `test-category-${Date.now()}`,
        is_active: true,
        ...categoryData
    };
    const [result] = await db_1.pool.query('INSERT INTO categories (name, description, slug, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [defaultData.name, defaultData.description, defaultData.slug, defaultData.is_active]);
    return { id: result.insertId, ...defaultData };
};
exports.createTestCategory = createTestCategory;
// Mock JWT token for testing
const createMockToken = (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id: 1, role: 'admin', email: 'test@example.com', ...payload }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};
exports.createMockToken = createMockToken;
// Test request helper
const createTestRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: { id: 1, role: 'admin', email: 'test@example.com' },
    ...overrides
});
exports.createTestRequest = createTestRequest;
// Test response helper
const createTestResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};
exports.createTestResponse = createTestResponse;
