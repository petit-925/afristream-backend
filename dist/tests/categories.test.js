"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../services/db");
describe('Categories API', () => {
    beforeEach(async () => {
        // Clean up test data
        await db_1.pool.query('DELETE FROM categories WHERE name LIKE "Test%"');
    });
    afterAll(async () => {
        // Clean up test data
        await db_1.pool.query('DELETE FROM categories WHERE name LIKE "Test%"');
    });
    describe('GET /api/v1/categories', () => {
        it('should return all active categories', async () => {
            // Insert test category
            await db_1.pool.query('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)', ['Test Category', 'test-category', true]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/categories')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
        it('should only return active categories', async () => {
            // Insert active and inactive categories
            await db_1.pool.query('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)', ['Test Active', 'test-active', true]);
            await db_1.pool.query('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)', ['Test Inactive', 'test-inactive', false]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/categories')
                .expect(200);
            const activeCategories = response.body.filter((cat) => cat.is_active === true);
            const inactiveCategories = response.body.filter((cat) => cat.is_active === false);
            expect(activeCategories.length).toBeGreaterThan(0);
            expect(inactiveCategories.length).toBe(0);
        });
    });
    describe('GET /api/v1/categories/:slug', () => {
        it('should return a category by slug', async () => {
            // Insert test category
            await db_1.pool.query('INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, ?)', ['Test Category by Slug', 'test-category-by-slug', 'Test description', true]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/categories/test-category-by-slug')
                .expect(200);
            expect(response.body.name).toBe('Test Category by Slug');
            expect(response.body.slug).toBe('test-category-by-slug');
            expect(response.body.description).toBe('Test description');
        });
        it('should return 404 for non-existent category', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/categories/non-existent-slug')
                .expect(404);
            expect(response.body.message).toBe('Category not found');
        });
        it('should return 404 for inactive category', async () => {
            // Insert inactive category
            await db_1.pool.query('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)', ['Test Inactive', 'test-inactive-category', false]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/categories/test-inactive-category')
                .expect(404);
            expect(response.body.message).toBe('Category not found');
        });
    });
});
