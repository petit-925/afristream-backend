// Authentication Tests
import { describe, it, expect, beforeEach } from '@jest/globals';
import { login, register } from '../modules/auth/auth.controller';
import { createTestUser, createTestRequest, createTestResponse, cleanupTestData } from './setup';
import { AppError } from '../common/errors/AppError';

describe('Authentication', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const req = createTestRequest({
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
          phone: '+1234567890',
          company: 'Test Company'
        }
      });
      const res = createTestResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({
            id: expect.any(Number),
            name: 'John Doe',
            email: 'john@example.com',
            role: 'client'
          })
        })
      );
    });

    it('should reject registration with invalid email', async () => {
      const req = createTestRequest({
        body: {
          name: 'John Doe',
          email: 'invalid-email',
          password: 'Password123'
        }
      });
      const res = createTestResponse();

      await expect(register(req, res)).rejects.toThrow(AppError);
    });

    it('should reject registration with weak password', async () => {
      const req = createTestRequest({
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: '123'
        }
      });
      const res = createTestResponse();

      await expect(register(req, res)).rejects.toThrow(AppError);
    });

    it('should reject registration with existing email', async () => {
      // Create existing user
      await createTestUser({ email: 'existing@example.com' });

      const req = createTestRequest({
        body: {
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'Password123'
        }
      });
      const res = createTestResponse();

      await expect(register(req, res)).rejects.toThrow(AppError);
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const testUser = await createTestUser({
        email: 'login@example.com',
        password: '$2a$12$test.hash' // This would be properly hashed in real scenario
      });

      const req = createTestRequest({
        body: {
          email: 'login@example.com',
          password: 'testpassword'
        }
      });
      const res = createTestResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({
            id: testUser.id,
            email: 'login@example.com'
          })
        })
      );
    });

    it('should reject login with invalid email', async () => {
      const req = createTestRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      });
      const res = createTestResponse();

      await expect(login(req, res)).rejects.toThrow(AppError);
    });

    it('should reject login with invalid password', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: '$2a$12$correct.hash'
      });

      const req = createTestRequest({
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });
      const res = createTestResponse();

      await expect(login(req, res)).rejects.toThrow(AppError);
    });

    it('should reject login for inactive user', async () => {
      await createTestUser({
        email: 'inactive@example.com',
        password: '$2a$12$test.hash',
        status: 'inactive'
      });

      const req = createTestRequest({
        body: {
          email: 'inactive@example.com',
          password: 'testpassword'
        }
      });
      const res = createTestResponse();

      await expect(login(req, res)).rejects.toThrow(AppError);
    });
  });
});
