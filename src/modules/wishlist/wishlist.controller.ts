import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../services/db';
import { AppError } from '../../common/errors/AppError';
import crypto from 'crypto';

const DEFAULT_LIST_NAME = 'Default';

// Normalize list name, falling back to Default
function normalizeListName(raw?: string): string {
  const name = (raw || '').trim();
  if (!name) return DEFAULT_LIST_NAME;
  return name.slice(0, 100);
}

async function ensureListId(userId: number, listName: string): Promise<number | null> {
  if (listName === DEFAULT_LIST_NAME) {
    // Use NULL list_id for default list for backward compatibility
    return null;
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM wishlist_lists WHERE user_id = ? AND name = ? LIMIT 1',
    [userId, listName]
  );
  const existing = rows[0];
  if (existing) return Number(existing.id);

  const [result] = await pool.query(
    'INSERT INTO wishlist_lists (user_id, name) VALUES (?, ?)',
    [userId, listName]
  );
  return (result as any).insertId as number;
}

// Get user wishlist grouped by list
export const getUserWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         w.*, 
         COALESCE(l.name, '${DEFAULT_LIST_NAME}') AS list_name,
         l.share_token,
         p.name as product_name, 
         p.price, 
         p.image_url, 
         p.description 
       FROM wishlist w 
       JOIN product p ON w.product_id = p.id 
       LEFT JOIN wishlist_lists l ON w.list_id = l.id
       WHERE w.user_id = ? 
       ORDER BY w.created_at DESC`,
      [userId]
    );

    // Group items by list_name for convenience
    const items = Array.isArray(rows) ? rows : [];
    const lists: Record<string, { name: string; shareToken?: string | null; items: any[] }> = {};
    for (const it of items) {
      const listName = (it as any).list_name || DEFAULT_LIST_NAME;
      const token = (it as any).share_token || null;
      if (!lists[listName]) {
        lists[listName] = { name: listName, shareToken: token, items: [] };
      }
      lists[listName].items.push(it);
    }

    res.json({
      lists,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user wishlist:', error);
    throw AppError.internal('Failed to fetch wishlist', error);
  }
};

// Add item to wishlist (optionally specifying list name)
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { product_id, listName } = req.body as { product_id?: number; listName?: string };

    if (!product_id) {
      throw AppError.badRequest('Product ID is required');
    }

    // Check if product exists
    const [productRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM product WHERE id = ?',
      [product_id]
    );

    if (productRows.length === 0) {
      throw AppError.notFound('Product not found');
    }

    const normalizedListName = normalizeListName(listName);
    const listId = await ensureListId(userId, normalizedListName);

    // Check if item is already in this list
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ? AND ((list_id IS NULL AND ? IS NULL) OR list_id = ?)',
      [userId, product_id, listId, listId]
    );

    if (existingRows.length > 0) {
      throw AppError.conflict('Item already in this wishlist list');
    }

    const [result] = await pool.query(
      'INSERT INTO wishlist (user_id, product_id, list_id) VALUES (?, ?, ?)',
      [userId, product_id, listId]
    );

    const insertId = (result as any).insertId;

    // Fetch the created wishlist item with product details
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT w.*, COALESCE(l.name, '${DEFAULT_LIST_NAME}') AS list_name, l.share_token, 
              p.name as product_name, p.price, p.image_url, p.description 
       FROM wishlist w 
       JOIN product p ON w.product_id = p.id 
       LEFT JOIN wishlist_lists l ON w.list_id = l.id
       WHERE w.id = ?`,
      [insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error adding to wishlist:', error);
    throw AppError.internal('Failed to add to wishlist', error);
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Check if wishlist item belongs to user
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM wishlist WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingRows.length === 0) {
      throw AppError.notFound('Wishlist item not found or does not belong to user');
    }

    await pool.query('DELETE FROM wishlist WHERE id = ?', [id]);

    res.json({ message: 'Item removed from wishlist successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error removing from wishlist:', error);
    throw AppError.internal('Failed to remove from wishlist', error);
  }
};

// Clear entire wishlist
export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    await pool.query('DELETE FROM wishlist WHERE user_id = ?', [userId]);

    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error clearing wishlist:', error);
    throw AppError.internal('Failed to clear wishlist', error);
  }
};

// Create or rename a list and return all lists
export const renameWishlistList = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }
    const { oldName, newName } = req.body as { oldName?: string; newName?: string };
    const targetOld = normalizeListName(oldName);
    const targetNew = normalizeListName(newName);

    if (!targetNew || targetNew === DEFAULT_LIST_NAME) {
      throw AppError.badRequest('New list name is invalid or reserved');
    }

    // Default list is represented by NULL list_id, cannot be renamed
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM wishlist_lists WHERE user_id = ? AND name = ? LIMIT 1',
      [userId, targetOld]
    );
    const listRow = rows[0];
    if (!listRow) {
      throw AppError.notFound('List not found');
    }

    await pool.query(
      'UPDATE wishlist_lists SET name = ? WHERE id = ? AND user_id = ?',
      [targetNew, listRow.id, userId]
    );

    res.json({ message: 'List renamed successfully' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error renaming wishlist list:', error);
    throw AppError.internal('Failed to rename wishlist list', error);
  }
};

// Generate or revoke a share link for a list
export const toggleWishlistShare = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }
    const { listName, enable } = req.body as { listName?: string; enable?: boolean };
    const targetName = normalizeListName(listName);
    if (targetName === DEFAULT_LIST_NAME) {
      throw AppError.badRequest('Default list cannot be shared');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, share_token FROM wishlist_lists WHERE user_id = ? AND name = ? LIMIT 1',
      [userId, targetName]
    );
    const listRow = rows[0];
    if (!listRow) {
      throw AppError.notFound('List not found');
    }

    if (enable) {
      const token = crypto.randomBytes(24).toString('hex');
      await pool.query('UPDATE wishlist_lists SET share_token = ? WHERE id = ?', [token, listRow.id]);
      return res.json({ message: 'Share link enabled', shareToken: token });
    }

    await pool.query('UPDATE wishlist_lists SET share_token = NULL WHERE id = ?', [listRow.id]);
    res.json({ message: 'Share link disabled' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error toggling wishlist share:', error);
    throw AppError.internal('Failed to update wishlist share settings', error);
  }
};

// Public: get shared wishlist by token
export const getSharedWishlist = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!token) {
      throw AppError.badRequest('Share token is required');
    }

    const [listRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id, name FROM wishlist_lists WHERE share_token = ? LIMIT 1',
      [token]
    );
    const listRow = listRows[0];
    if (!listRow) {
      throw AppError.notFound('Shared list not found');
    }

    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT w.*, p.name as product_name, p.price, p.image_url, p.description 
       FROM wishlist w 
       JOIN product p ON w.product_id = p.id 
       WHERE w.list_id = ? 
       ORDER BY w.created_at DESC`,
      [listRow.id]
    );

    res.json({
      name: listRow.name,
      items: itemRows,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error fetching shared wishlist:', error);
    throw AppError.internal('Failed to fetch shared wishlist', error);
  }
};
