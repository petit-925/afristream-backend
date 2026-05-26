import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../services/db';
import { AppError } from '../../common/errors/AppError';

// Get user support tickets
export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user tickets:', error);
    throw AppError.internal('Failed to fetch support tickets', error);
  }
};

// Get single support ticket
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM support_tickets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      throw AppError.notFound('Support ticket not found or does not belong to user');
    }

    res.json(rows[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching support ticket:', error);
    throw AppError.internal('Failed to fetch support ticket', error);
  }
};

// Create new support ticket
export const createTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { subject, message, priority = 'Medium' } = req.body;

    if (!subject || !message) {
      throw AppError.badRequest('Subject and message are required');
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!validPriorities.includes(priority)) {
      throw AppError.badRequest('Invalid priority level');
    }

    const [result] = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, message, priority) VALUES (?, ?, ?, ?)',
      [userId, subject, message, priority]
    );

    const insertId = (result as any).insertId;

    // Fetch the created ticket
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM support_tickets WHERE id = ?',
      [insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error creating support ticket:', error);
    throw AppError.internal('Failed to create support ticket', error);
  }
};

// Update support ticket (user can only update their own tickets)
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const { subject, message } = req.body;

    // Check if ticket belongs to user
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, status FROM support_tickets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingRows.length === 0) {
      throw AppError.notFound('Support ticket not found or does not belong to user');
    }

    const ticket = existingRows[0] as any;

    // Only allow updates if ticket is not closed
    if (ticket.status === 'Closed') {
      throw AppError.forbidden('Cannot update closed ticket');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (subject !== undefined) { updates.push('subject = ?'); values.push(subject); }
    if (message !== undefined) { updates.push('message = ?'); values.push(message); }

    if (updates.length === 0) {
      throw AppError.badRequest('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Fetch updated ticket
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM support_tickets WHERE id = ?',
      [id]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating support ticket:', error);
    throw AppError.internal('Failed to update support ticket', error);
  }
};
