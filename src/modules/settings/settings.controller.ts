import type { Request, Response } from 'express';
import { pool } from '../../services/db';
import type { RowDataPacket } from 'mysql2/promise';
import { AppError } from '../../common/errors/AppError';

// Schema expected:
// CREATE TABLE IF NOT EXISTS settings (
//   `key` varchar(100) PRIMARY KEY,
//   `value` json NOT NULL,
//   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );

export async function getSettings(_req: Request, res: Response) {
  try {
    await pool.query(
      'CREATE TABLE IF NOT EXISTS settings (`key` varchar(100) PRIMARY KEY, `value` json NOT NULL, updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)'
    );
    const [rows] = await pool.query<RowDataPacket[]>('SELECT `key`, `value` FROM settings');
    const obj: Record<string, any> = {};
    for (const r of rows) obj[r.key as string] = r.value;
    res.json(obj);
  } catch (error) {
    throw AppError.internal('Failed to load settings', error);
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const body = req.body as Record<string, any>;
    if (!body || typeof body !== 'object') throw AppError.badRequest('Invalid settings payload');

    await pool.query(
      'CREATE TABLE IF NOT EXISTS settings (`key` varchar(100) PRIMARY KEY, `value` json NOT NULL, updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)'
    );

    const keys = Object.keys(body);
    for (const key of keys) {
      const val = JSON.stringify(body[key] ?? null);
      await pool.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated_at=NOW()',
        [key, val]
      );
    }

    // Return merged settings
    const [rows] = await pool.query<RowDataPacket[]>('SELECT `key`, `value` FROM settings');
    const obj: Record<string, any> = {};
    for (const r of rows) obj[r.key as string] = r.value;
    res.json({ message: 'Settings updated successfully', settings: obj });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to update settings', error);
  }
}

