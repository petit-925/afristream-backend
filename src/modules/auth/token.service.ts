import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { pool } from '../../services/db';
import { env } from '../../config/env';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(payload: any): Tokens {
  const secret: Secret = env.JWT_SECRET as unknown as Secret;
  const toExpires = (val: unknown, fallback: string): string | number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const n = Number(val);
      return Number.isFinite(n) ? n : val; // allow "7d", or numeric seconds
    }
    return fallback;
  };
  const accessOpts: SignOptions = { expiresIn: toExpires(env.JWT_EXPIRES_IN, '15m') as any };
  const refreshOpts: SignOptions = { expiresIn: toExpires(env.REFRESH_TOKEN_EXPIRES_IN, '7d') as any };

  const accessToken = jwt.sign(payload, secret, accessOpts);
  const refreshToken = jwt.sign({ sub: payload.id, type: 'refresh' }, secret, refreshOpts);
  return { accessToken, refreshToken };
}

export async function storeRefreshToken(userId: number, refreshToken: string, isClient: boolean) {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, is_client, token, created_at) VALUES (?, ?, ?, NOW())',
    [userId, isClient ? 1 : 0, refreshToken]
  );
}

export async function revokeRefreshToken(token: string) {
  await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

export async function findRefreshToken(token: string) {
  const [rows] = await pool.query('SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1', [token]);
  return Array.isArray(rows) ? (rows as any[])[0] : null;
}


