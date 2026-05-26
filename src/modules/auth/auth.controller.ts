import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { pool } from '../../services/db';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/AppError';
import { loginSchema, registerSchema, refreshTokenSchema } from '../../common/validation/authSchemas';
import { generateTokens, storeRefreshToken, findRefreshToken, revokeRefreshToken } from './token.service';

export async function login(req: Request, res: Response) {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find admin user only (dashboard login)
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE email = ? LIMIT 1', [email]);
    const user = Array.isArray(rows) ? (rows as any[])[0] : null;
    
    if (!user || !user.password) {
      throw AppError.unauthorized('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw AppError.forbidden('Account is not active. Please contact support.');
    }

    // Generate token
    const tokens = generateTokens({ id: user.id, role: user.role, email: user.email });
    await storeRefreshToken(user.id, tokens.refreshToken, false);

    // Update last login
    await pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);

    res.json({ 
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        avatar: user.avatar_url,
        company: user.company
      } 
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal('Login failed', error);
  }
}

export async function register(req: Request, res: Response) {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, phone, company, location } = validatedData;

    // Check if email already exists in admin_users
    const [existsRows] = await pool.query('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [email]);
    if (Array.isArray(existsRows) && (existsRows as any[]).length) {
      throw AppError.conflict('Email already in use');
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Create user - auto-activate in development
    const now = new Date();
    const userStatus = process.env.NODE_ENV === 'development' ? 'active' : 'pending';
    const [result] = await pool.query(
      'INSERT INTO admin_users (name, email, password, phone, company, location, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hash, phone || null, company || null, location || null, 'admin', userStatus, now, now]
    );
    
    const insertId = (result as any).insertId;
    const [rows] = await pool.query('SELECT id, name, email, role, phone, company, location FROM admin_users WHERE id = ?', [insertId]);
    const created = Array.isArray(rows) ? (rows as any[])[0] : rows;
    
    // Generate token
    const tokens = generateTokens({ id: created.id, role: created.role, email: created.email });
    await storeRefreshToken(created.id, tokens.refreshToken, false);

    res.status(201).json({ 
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: created 
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal('Registration failed', error);
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

    if (!userId) throw AppError.unauthorized('Not authenticated');
    if (!currentPassword || !newPassword) throw AppError.badRequest('Missing fields');

    const [rows] = await pool.query('SELECT id, password FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = Array.isArray(rows) ? (rows as any[])[0] : null;
    if (!user || !user.password) throw AppError.notFound('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw AppError.unauthorized('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hash, userId]);

    res.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to change password', error);
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) throw AppError.unauthorized('Not authenticated');

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, company, phone, location FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    const user = Array.isArray(rows) ? (rows as any[])[0] : rows;
    if (!user) throw AppError.notFound('User not found');

    res.json({ user });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to fetch current user', error);
  }
}

