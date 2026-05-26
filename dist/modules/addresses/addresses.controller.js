"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getUserAddresses = void 0;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
// Get all user addresses
const getUserAddresses = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const [rows] = await db_1.pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
        res.json(rows);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching user addresses:', error);
        throw AppError_1.AppError.internal('Failed to fetch addresses', error);
    }
};
exports.getUserAddresses = getUserAddresses;
// Add new address
const addAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { full_name, street, city, region, zip_code, phone, is_default } = req.body;
        if (!full_name || !street || !city || !region || !zip_code || !phone) {
            throw AppError_1.AppError.badRequest('All address fields are required');
        }
        // If this is set as default, unset other default addresses
        if (is_default) {
            await db_1.pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
        }
        const [result] = await db_1.pool.query('INSERT INTO addresses (user_id, full_name, street, city, region, zip_code, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, full_name, street, city, region, zip_code, phone, is_default || false]);
        const insertId = result.insertId;
        // Fetch the created address
        const [rows] = await db_1.pool.query('SELECT * FROM addresses WHERE id = ?', [insertId]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error adding address:', error);
        throw AppError_1.AppError.internal('Failed to add address', error);
    }
};
exports.addAddress = addAddress;
// Update address
const updateAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        const { full_name, street, city, region, zip_code, phone, is_default } = req.body;
        // Check if address belongs to user
        const [existingRows] = await db_1.pool.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('Address not found or does not belong to user');
        }
        // If this is set as default, unset other default addresses
        if (is_default) {
            await db_1.pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?', [userId, id]);
        }
        const updates = [];
        const values = [];
        if (full_name !== undefined) {
            updates.push('full_name = ?');
            values.push(full_name);
        }
        if (street !== undefined) {
            updates.push('street = ?');
            values.push(street);
        }
        if (city !== undefined) {
            updates.push('city = ?');
            values.push(city);
        }
        if (region !== undefined) {
            updates.push('region = ?');
            values.push(region);
        }
        if (zip_code !== undefined) {
            updates.push('zip_code = ?');
            values.push(zip_code);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (is_default !== undefined) {
            updates.push('is_default = ?');
            values.push(is_default);
        }
        if (updates.length === 0) {
            throw AppError_1.AppError.badRequest('No valid fields to update');
        }
        updates.push('updated_at = NOW()');
        values.push(id);
        const query = `UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`;
        await db_1.pool.query(query, values);
        // Fetch updated address
        const [updatedRows] = await db_1.pool.query('SELECT * FROM addresses WHERE id = ?', [id]);
        res.json(updatedRows[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error updating address:', error);
        throw AppError_1.AppError.internal('Failed to update address', error);
    }
};
exports.updateAddress = updateAddress;
// Delete address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        // Check if address belongs to user
        const [existingRows] = await db_1.pool.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('Address not found or does not belong to user');
        }
        await db_1.pool.query('DELETE FROM addresses WHERE id = ?', [id]);
        res.json({ message: 'Address deleted successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error deleting address:', error);
        throw AppError_1.AppError.internal('Failed to delete address', error);
    }
};
exports.deleteAddress = deleteAddress;
// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        // Check if address belongs to user
        const [existingRows] = await db_1.pool.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('Address not found or does not belong to user');
        }
        // Unset all other default addresses for this user
        await db_1.pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
        // Set this address as default
        await db_1.pool.query('UPDATE addresses SET is_default = TRUE, updated_at = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Default address updated successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error setting default address:', error);
        throw AppError_1.AppError.internal('Failed to set default address', error);
    }
};
exports.setDefaultAddress = setDefaultAddress;
