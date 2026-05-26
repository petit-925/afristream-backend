import rateLimit from 'express-rate-limit';
import type { Express, Request, Response, NextFunction } from 'express';
import { env } from './env';

export function applySecurity(app: Express) {
  // Allow preflight requests to pass through without rate limiting
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Use very relaxed limits in development to avoid interfering with local testing/React StrictMode
  const isDev = env.NODE_ENV === 'development';
  const limiter = rateLimit({
    windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
    max: isDev ? 10000 : 100, // Increased from 1000 to 10000 for development
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks and OPTIONS requests
      return req.path === '/health' || req.method === 'OPTIONS';
    },
  });
  app.use(limiter);
}

