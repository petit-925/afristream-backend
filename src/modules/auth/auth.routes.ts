import { Router } from 'express';
import { login, register, changePassword, me } from './auth.controller';
import { authenticate } from '../../common/middleware/auth';
import { refreshTokenSchema } from '../../common/validation/authSchemas';
import { findRefreshToken, generateTokens, storeRefreshToken, revokeRefreshToken } from './token.service';
import { AppError } from '../../common/errors/AppError';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export const router = Router();

router.post('/login', login);
router.post('/register', register);

// Protected ping for dashboards
router.get('/protected', (_req, res) => res.json({ ok: true }));

// Change password
router.post('/password', authenticate, changePassword);

// Get current authenticated user
router.get('/me', authenticate, me);

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const stored = await findRefreshToken(refreshToken);
    if (!stored) throw AppError.unauthorized('Invalid refresh token');

    const payload: any = jwt.verify(refreshToken, env.JWT_SECRET as string);
    const isClient = !!stored.is_client;
    const tokens = generateTokens({ id: payload.sub, role: isClient ? 'client' : 'admin' });
    await revokeRefreshToken(refreshToken);
    await storeRefreshToken(payload.sub, tokens.refreshToken, isClient);
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to refresh token', error);
  }
});

