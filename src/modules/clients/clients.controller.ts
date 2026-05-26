import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../services/db';
import { AppError } from '../../common/errors/AppError';

interface RawClientRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  two_factor_enabled: number | null;
  created_at: Date;
  updated_at: Date;
}

const mapClientUser = (row: RawClientRow) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone ?? '',
  company: null,
  location: row.address ?? '',
  avatar: row.avatar_url ?? '',
  joinDate: row.created_at,
  totalProjects: 0,
  totalSpent: 0,
  status: 'active',
  rating: 0,
  lastContact: row.updated_at,
  projectTypes: [] as string[],
  twoFactorEnabled: !!row.two_factor_enabled,
});

export async function listClients(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RawClientRow[]>(
      'SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, created_at, updated_at FROM client_users ORDER BY created_at DESC'
    );
    const clients = rows.map(mapClientUser);
    res.json(clients);
  } catch (error) {
    console.error('Failed to list clients:', error);
    res.json([]);
  }
}

export async function createClient(req: Request, res: Response) {
  const data = req.body as any;

  if (!data?.name || !data?.email) {
    throw AppError.badRequest('Client name and email are required');
  }

  const now = new Date();

  const [result] = await pool.query(
    'INSERT INTO client_users (name, email, password, phone, address, avatar_url, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.name,
      data.email,
      '',
      data.phone || null,
      data.location || data.address || null,
      data.avatar || data.avatar_url || null,
      0,
      now,
      now,
    ]
  );

  const insertId = (result as any).insertId;
  const [rows] = await pool.query<RawClientRow[]>(
    'SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, created_at, updated_at FROM client_users WHERE id = ? LIMIT 1',
    [insertId]
  );

  if (!rows.length) {
    throw AppError.internal('Failed to load newly created client');
  }

  res.status(201).json(mapClientUser(rows[0]));
}

