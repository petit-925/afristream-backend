import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import { clientRegister, clientLogin, clientMe, clientChangePassword } from './client.auth.controller';
import { refreshTokenSchema } from '../../common/validation/authSchemas';
import { findRefreshToken, generateTokens, storeRefreshToken, revokeRefreshToken } from './token.service';
import { AppError } from '../../common/errors/AppError';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export const router = Router();

// Public
router.post('/register', clientRegister);
router.post('/login', clientLogin);

// Authenticated
router.get('/me', authenticate, clientMe);
router.put('/change-password', authenticate, clientChangePassword);

// Refresh access token (client)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const stored = await findRefreshToken(refreshToken);
    if (!stored || !stored.is_client) throw AppError.unauthorized('Invalid refresh token');
    const payload: any = jwt.verify(refreshToken, env.JWT_SECRET as string);
    const tokens = generateTokens({ id: payload.sub, role: 'client' });
    await revokeRefreshToken(refreshToken);
    await storeRefreshToken(payload.sub, tokens.refreshToken, true);
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to refresh token', error);
  }
});

export default router;


