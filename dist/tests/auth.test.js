"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Authentication Tests
const globals_1 = require("@jest/globals");
const auth_controller_1 = require("../modules/auth/auth.controller");
const setup_1 = require("./setup");
const AppError_1 = require("../common/errors/AppError");
(0, globals_1.describe)('Authentication', () => {
    (0, globals_1.beforeEach)(async () => {
        await (0, setup_1.cleanupTestData)();
    });
    (0, globals_1.describe)('User Registration', () => {
        (0, globals_1.it)('should register a new user successfully', async () => {
            const req = (0, setup_1.createTestRequest)({
                body: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password123',
                    phone: '+1234567890',
                    company: 'Test Company'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, auth_controller_1.register)(req, res);
            (0, globals_1.expect)(res.status).toHaveBeenCalledWith(201);
            (0, globals_1.expect)(res.json).toHaveBeenCalledWith(globals_1.expect.objectContaining({
                success: true,
                token: globals_1.expect.any(String),
                user: globals_1.expect.objectContaining({
                    id: globals_1.expect.any(Number),
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'client'
                })
            }));
        });
        (0, globals_1.it)('should reject registration with invalid email', async () => {
            const req = (0, setup_1.createTestRequest)({
                body: {
                    name: 'John Doe',
                    email: 'invalid-email',
                    password: 'Password123'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, globals_1.expect)((0, auth_controller_1.register)(req, res)).rejects.toThrow(AppError_1.AppError);
        });
        (0, globals_1.it)('should reject registration with weak password', async () => {
            const req = (0, setup_1.createTestRequest)({
                body: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: '123'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, globals_1.expect)((0, auth_controller_1.register)(req, res)).rejects.toThrow(AppError_1.AppError);
        });
        (0, globals_1.it)('should reject registration with existing email', async () => {
            // Create existing user
            await (0, setup_1.createTestUser)({ email: 'existing@example.com' });
            const req = (0, setup_1.createTestRequest)({
                body: {
                    name: 'John Doe',
                    email: 'existing@example.com',
                    password: 'Password123'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, globals_1.expect)((0, auth_controller_1.register)(req, res)).rejects.toThrow(AppError_1.AppError);
        });
    });
    (0, globals_1.describe)('User Login', () => {
        (0, globals_1.it)('should login with valid credentials', async () => {
            // Create test user
            const testUser = await (0, setup_1.createTestUser)({
                email: 'login@example.com',
                password: '$2a$12$test.hash' // This would be properly hashed in real scenario
            });
            const req = (0, setup_1.createTestRequest)({
                body: {
                    email: 'login@example.com',
                    password: 'testpassword'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, auth_controller_1.login)(req, res);
            (0, globals_1.expect)(res.status).toHaveBeenCalledWith(200);
            (0, globals_1.expect)(res.json).toHaveBeenCalledWith(globals_1.expect.objectContaining({
                success: true,
                token: globals_1.expect.any(String),
                user: globals_1.expect.objectContaining({
                    id: testUser.id,
                    email: 'login@example.com'
                })
            }));
        });
        (0, globals_1.it)('should reject login with invalid email', async () => {
            const req = (0, setup_1.createTestRequest)({
                body: {
                    email: 'nonexistent@example.com',
                    password: 'password123'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, globals_1.expect)((0, auth_controller_1.login)(req, res)).rejects.toThrow(AppError_1.AppError);
        });
        (0, globals_1.it)('should reject login with invalid password', async () => {
            await (0, setup_1.createTestUser)({
                email: 'test@example.com',
                password: '$2a$12$correct.hash'
            });
            const req = (0, setup_1.createTestRequest)({
                body: {
                    email: 'test@example.com',
                    password: 'wrongpassword'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, globals_1.expect)((0, auth_controller_1.login)(req, res)).rejects.toThrow(AppError_1.AppError);
        });
        (0, globals_1.it)('should reject login for inactive user', async () => {
            await (0, setup_1.createTestUser)({
                email: 'inactive@example.com',
                password: '$2a$12$test.hash',
                status: 'inactive'
            });
            const req = (0, setup_1.createTestRequest)({
                body: {
                    email: 'inactive@example.com',
                    password: 'testpassword'
                }
            });
            const res = (0, setup_1.createTestResponse)();
            await (0, globals_1.expect)((0, auth_controller_1.login)(req, res)).rejects.toThrow(AppError_1.AppError);
        });
    });
});
