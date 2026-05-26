"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedWishlist = exports.toggleWishlistShare = exports.renameWishlistList = exports.clearWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getUserWishlist = void 0;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
const crypto_1 = __importDefault(require("crypto"));
const DEFAULT_LIST_NAME = 'Default';
// Normalize list name, falling back to Default
function normalizeListName(raw) {
    const name = (raw || '').trim();
    if (!name)
        return DEFAULT_LIST_NAME;
    return name.slice(0, 100);
}
async function ensureListId(userId, listName) {
    if (listName === DEFAULT_LIST_NAME) {
        // Use NULL list_id for default list for backward compatibility
        return null;
    }
    const [rows] = await db_1.pool.query('SELECT id FROM wishlist_lists WHERE user_id = ? AND name = ? LIMIT 1', [userId, listName]);
    const existing = rows[0];
    if (existing)
        return Number(existing.id);
    const [result] = await db_1.pool.query('INSERT INTO wishlist_lists (user_id, name) VALUES (?, ?)', [userId, listName]);
    return result.insertId;
}
// Get user wishlist grouped by list
const getUserWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const [rows] = await db_1.pool.query(`SELECT 
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
       ORDER BY w.created_at DESC`, [userId]);
        // Group items by list_name for convenience
        const items = Array.isArray(rows) ? rows : [];
        const lists = {};
        for (const it of items) {
            const listName = it.list_name || DEFAULT_LIST_NAME;
            const token = it.share_token || null;
            if (!lists[listName]) {
                lists[listName] = { name: listName, shareToken: token, items: [] };
            }
            lists[listName].items.push(it);
        }
        res.json({
            lists,
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching user wishlist:', error);
        throw AppError_1.AppError.internal('Failed to fetch wishlist', error);
    }
};
exports.getUserWishlist = getUserWishlist;
// Add item to wishlist (optionally specifying list name)
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { product_id, listName } = req.body;
        if (!product_id) {
            throw AppError_1.AppError.badRequest('Product ID is required');
        }
        // Check if product exists
        const [productRows] = await db_1.pool.query('SELECT id FROM product WHERE id = ?', [product_id]);
        if (productRows.length === 0) {
            throw AppError_1.AppError.notFound('Product not found');
        }
        const normalizedListName = normalizeListName(listName);
        const listId = await ensureListId(userId, normalizedListName);
        // Check if item is already in this list
        const [existingRows] = await db_1.pool.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ? AND ((list_id IS NULL AND ? IS NULL) OR list_id = ?)', [userId, product_id, listId, listId]);
        if (existingRows.length > 0) {
            throw AppError_1.AppError.conflict('Item already in this wishlist list');
        }
        const [result] = await db_1.pool.query('INSERT INTO wishlist (user_id, product_id, list_id) VALUES (?, ?, ?)', [userId, product_id, listId]);
        const insertId = result.insertId;
        // Fetch the created wishlist item with product details
        const [rows] = await db_1.pool.query(`SELECT w.*, COALESCE(l.name, '${DEFAULT_LIST_NAME}') AS list_name, l.share_token, 
              p.name as product_name, p.price, p.image_url, p.description 
       FROM wishlist w 
       JOIN product p ON w.product_id = p.id 
       LEFT JOIN wishlist_lists l ON w.list_id = l.id
       WHERE w.id = ?`, [insertId]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error adding to wishlist:', error);
        throw AppError_1.AppError.internal('Failed to add to wishlist', error);
    }
};
exports.addToWishlist = addToWishlist;
// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        // Check if wishlist item belongs to user
        const [existingRows] = await db_1.pool.query('SELECT id FROM wishlist WHERE id = ? AND user_id = ?', [id, userId]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('Wishlist item not found or does not belong to user');
        }
        await db_1.pool.query('DELETE FROM wishlist WHERE id = ?', [id]);
        res.json({ message: 'Item removed from wishlist successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error removing from wishlist:', error);
        throw AppError_1.AppError.internal('Failed to remove from wishlist', error);
    }
};
exports.removeFromWishlist = removeFromWishlist;
// Clear entire wishlist
const clearWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        await db_1.pool.query('DELETE FROM wishlist WHERE user_id = ?', [userId]);
        res.json({ message: 'Wishlist cleared successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error clearing wishlist:', error);
        throw AppError_1.AppError.internal('Failed to clear wishlist', error);
    }
};
exports.clearWishlist = clearWishlist;
// Create or rename a list and return all lists
const renameWishlistList = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { oldName, newName } = req.body;
        const targetOld = normalizeListName(oldName);
        const targetNew = normalizeListName(newName);
        if (!targetNew || targetNew === DEFAULT_LIST_NAME) {
            throw AppError_1.AppError.badRequest('New list name is invalid or reserved');
        }
        // Default list is represented by NULL list_id, cannot be renamed
        const [rows] = await db_1.pool.query('SELECT id FROM wishlist_lists WHERE user_id = ? AND name = ? LIMIT 1', [userId, targetOld]);
        const listRow = rows[0];
        if (!listRow) {
            throw AppError_1.AppError.notFound('List not found');
        }
        await db_1.pool.query('UPDATE wishlist_lists SET name = ? WHERE id = ? AND user_id = ?', [targetNew, listRow.id, userId]);
        res.json({ message: 'List renamed successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        console.error('Error renaming wishlist list:', error);
        throw AppError_1.AppError.internal('Failed to rename wishlist list', error);
    }
};
exports.renameWishlistList = renameWishlistList;
// Generate or revoke a share link for a list
const toggleWishlistShare = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { listName, enable } = req.body;
        const targetName = normalizeListName(listName);
        if (targetName === DEFAULT_LIST_NAME) {
            throw AppError_1.AppError.badRequest('Default list cannot be shared');
        }
        const [rows] = await db_1.pool.query('SELECT id, share_token FROM wishlist_lists WHERE user_id = ? AND name = ? LIMIT 1', [userId, targetName]);
        const listRow = rows[0];
        if (!listRow) {
            throw AppError_1.AppError.notFound('List not found');
        }
        if (enable) {
            const token = crypto_1.default.randomBytes(24).toString('hex');
            await db_1.pool.query('UPDATE wishlist_lists SET share_token = ? WHERE id = ?', [token, listRow.id]);
            return res.json({ message: 'Share link enabled', shareToken: token });
        }
        await db_1.pool.query('UPDATE wishlist_lists SET share_token = NULL WHERE id = ?', [listRow.id]);
        res.json({ message: 'Share link disabled' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        console.error('Error toggling wishlist share:', error);
        throw AppError_1.AppError.internal('Failed to update wishlist share settings', error);
    }
};
exports.toggleWishlistShare = toggleWishlistShare;
// Public: get shared wishlist by token
const getSharedWishlist = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            throw AppError_1.AppError.badRequest('Share token is required');
        }
        const [listRows] = await db_1.pool.query('SELECT id, user_id, name FROM wishlist_lists WHERE share_token = ? LIMIT 1', [token]);
        const listRow = listRows[0];
        if (!listRow) {
            throw AppError_1.AppError.notFound('Shared list not found');
        }
        const [itemRows] = await db_1.pool.query(`SELECT w.*, p.name as product_name, p.price, p.image_url, p.description 
       FROM wishlist w 
       JOIN product p ON w.product_id = p.id 
       WHERE w.list_id = ? 
       ORDER BY w.created_at DESC`, [listRow.id]);
        res.json({
            name: listRow.name,
            items: itemRows,
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        console.error('Error fetching shared wishlist:', error);
        throw AppError_1.AppError.internal('Failed to fetch shared wishlist', error);
    }
};
exports.getSharedWishlist = getSharedWishlist;
