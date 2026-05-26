import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface AuthRequest extends Request {
  user?: any;
}

const buildAuthError = (message: string) => ({ error: message });

const getBearerToken = (req: Request, res: Response): string | null => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json(buildAuthError('Access denied. No token provided.'));
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) {
    res.status(401).json(buildAuthError('Access denied. Invalid authorization header format.'));
    return null;
  }

  return match[1];
};

const verifyToken = (token: string, res: Response) => {
  try {
    return jwt.verify(token, env.JWT_SECRET as string);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json(buildAuthError('Token expired. Please log in again.'));
        return null;
      }
      if (error.name === 'NotBeforeError') {
        res.status(401).json(buildAuthError('Token not active yet.'));
        return null;
      }
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json(buildAuthError('Invalid token.'));
        return null;
      }

      res.status(500).json(buildAuthError('Failed to authenticate token.'));
      return null;
    }

    res.status(500).json(buildAuthError('Failed to authenticate token.'));
    return null;
  }
};

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = getBearerToken(req, res);
  if (!token) return;

  const decoded = verifyToken(token, res);
  if (!decoded) return;

  req.user = decoded;

  const userPayload = decoded as any;
  if (!userPayload || (userPayload.role !== 'admin' && userPayload.isAdmin !== true)) {
    return res.status(403).json(buildAuthError('Forbidden: Admins only.'));
  }

  next();
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = getBearerToken(req, res);
  if (!token) return;

  const decoded = verifyToken(token, res);
  if (!decoded) return;

  req.user = decoded;
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = getBearerToken(req, res);
    if (!token) return;

    const decoded = verifyToken(token, res);
    if (!decoded) return;

    req.user = decoded;

    if (!roles.includes((decoded as any).role)) {
      return res.status(403).json(buildAuthError('Forbidden: Insufficient permissions.'));
    }

    next();
  };
};