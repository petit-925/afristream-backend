import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../services/db';
import { AppError } from '../../common/errors/AppError';

// Get user sessions
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM sessions WHERE user_id = ? AND is_active = TRUE ORDER BY last_active DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user sessions:', error);
    throw AppError.internal('Failed to fetch sessions', error);
  }
};

// Log out from specific session
export const logoutSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Check if session belongs to user
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingRows.length === 0) {
      throw AppError.notFound('Session not found or does not belong to user');
    }

    await pool.query('UPDATE sessions SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [id]);

    res.json({ message: 'Session logged out successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error logging out session:', error);
    throw AppError.internal('Failed to logout session', error);
  }
};

// Log out from all other sessions (except current)
export const logoutAllOtherSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const currentSessionId = (req as any).sessionId; // This would need to be set by middleware

    if (currentSessionId) {
      await pool.query(
        'UPDATE sessions SET is_active = FALSE, updated_at = NOW() WHERE user_id = ? AND id != ?',
        [userId, currentSessionId]
      );
    } else {
      await pool.query(
        'UPDATE sessions SET is_active = FALSE, updated_at = NOW() WHERE user_id = ?',
        [userId]
      );
    }

    res.json({ message: 'All other sessions logged out successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error logging out all sessions:', error);
    throw AppError.internal('Failed to logout all sessions', error);
  }
};

// Toggle Two-Factor Authentication
export const toggleTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      throw AppError.badRequest('Enabled field must be a boolean');
    }

    await pool.query(
      'UPDATE users SET two_factor_enabled = ?, updated_at = NOW() WHERE id = ?',
      [enabled, userId]
    );

    res.json({ 
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      two_factor_enabled: enabled
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error toggling two-factor authentication:', error);
    throw AppError.internal('Failed to toggle two-factor authentication', error);
  }
};
