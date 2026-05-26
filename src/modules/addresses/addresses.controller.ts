import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../services/db';
import { AppError } from '../../common/errors/AppError';

// Get all user addresses
export const getUserAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user addresses:', error);
    throw AppError.internal('Failed to fetch addresses', error);
  }
};

// Add new address
export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { full_name, street, city, region, zip_code, phone, is_default } = req.body;

    if (!full_name || !street || !city || !region || !zip_code || !phone) {
      throw AppError.badRequest('All address fields are required');
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, full_name, street, city, region, zip_code, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, full_name, street, city, region, zip_code, phone, is_default || false]
    );

    const insertId = (result as any).insertId;

    // Fetch the created address
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE id = ?',
      [insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error adding address:', error);
    throw AppError.internal('Failed to add address', error);
  }
};

// Update address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const { full_name, street, city, region, zip_code, phone, is_default } = req.body;

    // Check if address belongs to user
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingRows.length === 0) {
      throw AppError.notFound('Address not found or does not belong to user');
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?', [userId, id]);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (full_name !== undefined) { updates.push('full_name = ?'); values.push(full_name); }
    if (street !== undefined) { updates.push('street = ?'); values.push(street); }
    if (city !== undefined) { updates.push('city = ?'); values.push(city); }
    if (region !== undefined) { updates.push('region = ?'); values.push(region); }
    if (zip_code !== undefined) { updates.push('zip_code = ?'); values.push(zip_code); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (is_default !== undefined) { updates.push('is_default = ?'); values.push(is_default); }

    if (updates.length === 0) {
      throw AppError.badRequest('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Fetch updated address
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE id = ?',
      [id]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating address:', error);
    throw AppError.internal('Failed to update address', error);
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Check if address belongs to user
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingRows.length === 0) {
      throw AppError.notFound('Address not found or does not belong to user');
    }

    await pool.query('DELETE FROM addresses WHERE id = ?', [id]);

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error deleting address:', error);
    throw AppError.internal('Failed to delete address', error);
  }
};

// Set default address
export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Check if address belongs to user
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingRows.length === 0) {
      throw AppError.notFound('Address not found or does not belong to user');
    }

    // Unset all other default addresses for this user
    await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);

    // Set this address as default
    await pool.query('UPDATE addresses SET is_default = TRUE, updated_at = NOW() WHERE id = ?', [id]);

    res.json({ message: 'Default address updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error setting default address:', error);
    throw AppError.internal('Failed to set default address', error);
  }
};
