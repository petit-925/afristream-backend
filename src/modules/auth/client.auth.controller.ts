import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { pool } from '../../services/db';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/AppError';
import { clientRegisterSchema, clientLoginSchema, changePasswordSchema } from '../../common/validation/authSchemas';
import { generateTokens, storeRefreshToken } from './token.service';

export async function clientRegister(req: Request, res: Response) {
  try {
    const { name, email, password, phone, address } = clientRegisterSchema.parse(req.body);

    const [existsRows] = await pool.query('SELECT id FROM client_users WHERE email = ? LIMIT 1', [email]);
    if (Array.isArray(existsRows) && (existsRows as any[]).length) {
      throw AppError.conflict('Email already in use');
    }

    const hash = await bcrypt.hash(password, 12);
    const now = new Date();
    const [result] = await pool.query(
      'INSERT INTO client_users (name, email, password, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hash, phone || null, address || null, now, now]
    );

    const id = (result as any).insertId;
    const tokens = generateTokens({ id, role: 'client', email });
    await storeRefreshToken(id, tokens.refreshToken, true);
    res.status(201).json({ success: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id, name, email, phone: phone || null, address: address || null } });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Client registration failed', error);
  }
}

export async function clientLogin(req: Request, res: Response) {
  try {
    const { email, password } = clientLoginSchema.parse(req.body);

    const [rows] = await pool.query('SELECT * FROM client_users WHERE email = ? LIMIT 1', [email]);
    const user = Array.isArray(rows) ? (rows as any[])[0] : null;
    if (!user || !user.password) throw AppError.unauthorized('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw AppError.unauthorized('Invalid credentials');

    const tokens = generateTokens({ id: user.id, role: 'client', email: user.email });
    await storeRefreshToken(user.id, tokens.refreshToken, true);
    res.json({ success: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, avatar_url: user.avatar_url } });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Client login failed', error);
  }
}

export async function clientMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) throw AppError.unauthorized('Not authenticated');

    const [rows] = await pool.query('SELECT id, name, email, phone, address, avatar_url FROM client_users WHERE id = ? LIMIT 1', [userId]);
    const user = Array.isArray(rows) ? (rows as any[])[0] : rows;
    if (!user) throw AppError.notFound('User not found');

    res.json({ user });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to fetch current user', error);
  }
}

export async function clientChangePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword, confirmPassword } = changePasswordSchema.parse(req.body) as any;
    if (!userId) throw AppError.unauthorized('Not authenticated');

    const [rows] = await pool.query('SELECT id, password FROM client_users WHERE id = ? LIMIT 1', [userId]);
    const user = Array.isArray(rows) ? (rows as any[])[0] : null;
    if (!user || !user.password) throw AppError.notFound('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw AppError.unauthorized('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE client_users SET password = ?, updated_at = NOW() WHERE id = ?', [hash, userId]);

    res.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to change password', error);
  }
}


