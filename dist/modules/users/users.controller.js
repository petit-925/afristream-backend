"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = exports.changePassword = exports.uploadAvatar = exports.updateUserProfile = exports.getFullUserProfile = exports.getUserStats = exports.updateCurrentUserProfile = exports.getCurrentUserProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get all users
const getUsers = async (req, res) => {
    try {
        const [rows] = await db_1.pool.query('SELECT id, name, email, role, status, phone, company, location, avatar_url, created_at, last_login FROM users ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        throw AppError_1.AppError.internal('Failed to fetch users', error);
    }
};
exports.getUsers = getUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db_1.pool.query('SELECT id, name, email, role, status, phone, company, location, bio, website, experience, specialties, skills, created_at, last_login FROM users WHERE id = ?', [id]);
        const users = rows;
        if (users.length === 0) {
            throw AppError_1.AppError.notFound('User not found');
        }
        res.json(users[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching user:', error);
        throw AppError_1.AppError.internal('Failed to fetch user', error);
    }
};
exports.getUserById = getUserById;
// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, status, phone, company, location, bio, website, experience, specialties, skills } = req.body;
        // Check if user exists
        const [existingRows] = await db_1.pool.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('User not found');
        }
        // Check if email is already taken by another user
        if (email) {
            const [emailRows] = await db_1.pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
            if (emailRows.length > 0) {
                throw AppError_1.AppError.conflict('Email already in use by another user');
            }
        }
        // Build update query dynamically
        const updates = [];
        const values = [];
        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (role !== undefined) {
            updates.push('role = ?');
            values.push(role);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (company !== undefined) {
            updates.push('company = ?');
            values.push(company);
        }
        if (location !== undefined) {
            updates.push('location = ?');
            values.push(location);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            values.push(bio);
        }
        if (website !== undefined) {
            updates.push('website = ?');
            values.push(website);
        }
        if (experience !== undefined) {
            updates.push('experience = ?');
            values.push(experience);
        }
        if (specialties !== undefined) {
            updates.push('specialties = ?');
            values.push(specialties);
        }
        if (skills !== undefined) {
            updates.push('skills = ?');
            values.push(skills);
        }
        if (updates.length === 0) {
            throw AppError_1.AppError.badRequest('No valid fields to update');
        }
        updates.push('updated_at = NOW()');
        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db_1.pool.query(query, values);
        // Fetch updated user
        const [updatedRows] = await db_1.pool.query('SELECT id, name, email, role, status, phone, company, location, bio, website, experience, specialties, skills, created_at, last_login FROM users WHERE id = ?', [id]);
        const updatedUser = updatedRows[0];
        res.json(updatedUser);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error updating user:', error);
        throw AppError_1.AppError.internal('Failed to update user', error);
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user exists
        const [existingRows] = await db_1.pool.query('SELECT id, role, is_protected FROM users WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('User not found');
        }
        const user = existingRows[0];
        // Prevent deletion of protected users (like default admin)
        if (user.is_protected) {
            throw AppError_1.AppError.forbidden('Cannot delete protected user account');
        }
        // Prevent deletion of the last admin
        if (user.role === 'admin') {
            const [adminRows] = await db_1.pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
            const adminCount = adminRows[0].count;
            if (adminCount <= 1) {
                throw AppError_1.AppError.forbidden('Cannot delete the last admin user');
            }
        }
        // Delete user
        await db_1.pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error deleting user:', error);
        throw AppError_1.AppError.internal('Failed to delete user', error);
    }
};
exports.deleteUser = deleteUser;
// Get current user profile (from JWT token)
const getCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const [rows] = await db_1.pool.query('SELECT id, name, email, role, status, account_type, phone, address, company, location, bio, website, experience, specialties, skills, avatar_url, two_factor_enabled, created_at, last_login FROM users WHERE id = ?', [userId]);
        const users = rows;
        if (users.length === 0) {
            throw AppError_1.AppError.notFound('User not found');
        }
        res.json(users[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching user profile:', error);
        throw AppError_1.AppError.internal('Failed to fetch user profile', error);
    }
};
exports.getCurrentUserProfile = getCurrentUserProfile;
// Update current user profile (from JWT token)
const updateCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { name, email, phone, address, company, location, bio, website, experience, specialties, skills, avatar_url } = req.body;
        // Check if email is already taken by another user
        if (email) {
            const [emailRows] = await db_1.pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (emailRows.length > 0) {
                throw AppError_1.AppError.conflict('Email already in use by another user');
            }
        }
        // Build update query dynamically
        const updates = [];
        const values = [];
        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            values.push(address);
        }
        if (company !== undefined) {
            updates.push('company = ?');
            values.push(company);
        }
        if (location !== undefined) {
            updates.push('location = ?');
            values.push(location);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            values.push(bio);
        }
        if (website !== undefined) {
            updates.push('website = ?');
            values.push(website);
        }
        if (experience !== undefined) {
            updates.push('experience = ?');
            values.push(experience);
        }
        if (specialties !== undefined) {
            updates.push('specialties = ?');
            values.push(specialties);
        }
        if (skills !== undefined) {
            updates.push('skills = ?');
            values.push(skills);
        }
        if (avatar_url !== undefined) {
            updates.push('avatar_url = ?');
            values.push(avatar_url);
        }
        if (updates.length === 0) {
            throw AppError_1.AppError.badRequest('No valid fields to update');
        }
        updates.push('updated_at = NOW()');
        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db_1.pool.query(query, values);
        // Fetch updated user
        const [updatedRows] = await db_1.pool.query('SELECT id, name, email, role, status, account_type, phone, address, company, location, bio, website, experience, specialties, skills, avatar_url, two_factor_enabled, created_at, last_login FROM users WHERE id = ?', [userId]);
        const updatedUser = updatedRows[0];
        res.json(updatedUser);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error updating user profile:', error);
        throw AppError_1.AppError.internal('Failed to update user profile', error);
    }
};
exports.updateCurrentUserProfile = updateCurrentUserProfile;
// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const [totalRows] = await db_1.pool.query('SELECT COUNT(*) as total FROM users');
        const [activeRows] = await db_1.pool.query('SELECT COUNT(*) as active FROM users WHERE status = "active"');
        const [adminRows] = await db_1.pool.query('SELECT COUNT(*) as admins FROM users WHERE role = "admin"');
        const [clientRows] = await db_1.pool.query('SELECT COUNT(*) as clients FROM users WHERE role = "client"');
        const total = totalRows[0].total;
        const active = activeRows[0].active;
        const admins = adminRows[0].admins;
        const clients = clientRows[0].clients;
        res.json({
            total,
            active,
            inactive: total - active,
            admins,
            clients,
            editors: total - admins - clients
        });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        throw AppError_1.AppError.internal('Failed to fetch user statistics', error);
    }
};
exports.getUserStats = getUserStats;
// =============================================
// NEW PROFILE SYSTEM FUNCTIONS
// =============================================
// Get full user profile with completion percentage
const getFullUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        // Get user basic info
        const [userRows] = await db_1.pool.query('SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, role, status, created_at, updated_at FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            throw AppError_1.AppError.notFound('User not found');
        }
        const user = userRows[0];
        // Calculate profile completion percentage
        let completed = 0;
        const total = 5;
        if (user.name)
            completed++;
        if (user.email)
            completed++;
        if (user.phone)
            completed++;
        if (user.address)
            completed++;
        if (user.avatar_url)
            completed++;
        const profileCompletion = Math.round((completed / total) * 100);
        // Get user addresses
        const [addressRows] = await db_1.pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
        res.json({
            ...user,
            profileCompletion,
            addresses: addressRows
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching full user profile:', error);
        throw AppError_1.AppError.internal('Failed to fetch user profile', error);
    }
};
exports.getFullUserProfile = getFullUserProfile;
// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { name, email, phone, address, avatar_url } = req.body;
        // Check if email is already taken by another user
        if (email) {
            const [emailRows] = await db_1.pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (emailRows.length > 0) {
                throw AppError_1.AppError.conflict('Email already in use by another user');
            }
        }
        // Build update query dynamically
        const updates = [];
        const values = [];
        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            values.push(address);
        }
        if (avatar_url !== undefined) {
            updates.push('avatar_url = ?');
            values.push(avatar_url);
        }
        if (updates.length === 0) {
            throw AppError_1.AppError.badRequest('No valid fields to update');
        }
        updates.push('updated_at = NOW()');
        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db_1.pool.query(query, values);
        // Fetch updated user
        const [updatedRows] = await db_1.pool.query('SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, role, status, created_at, updated_at FROM users WHERE id = ?', [userId]);
        const updatedUser = updatedRows[0];
        res.json(updatedUser);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error updating user profile:', error);
        throw AppError_1.AppError.internal('Failed to update user profile', error);
    }
};
exports.updateUserProfile = updateUserProfile;
// Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const avatarUrl = req.file?.path || req.body.avatar_url;
        if (!avatarUrl) {
            throw AppError_1.AppError.badRequest('No avatar file provided');
        }
        await db_1.pool.query('UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?', [avatarUrl, userId]);
        res.json({
            message: 'Avatar uploaded successfully',
            avatar_url: avatarUrl
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error uploading avatar:', error);
        throw AppError_1.AppError.internal('Failed to upload avatar', error);
    }
};
exports.uploadAvatar = uploadAvatar;
// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw AppError_1.AppError.badRequest('Current password and new password are required');
        }
        // Get current password hash
        const [userRows] = await db_1.pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            throw AppError_1.AppError.notFound('User not found');
        }
        const user = userRows[0];
        // Verify current password
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw AppError_1.AppError.unauthorized('Current password is incorrect');
        }
        // Hash new password
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        await db_1.pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedNewPassword, userId]);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error changing password:', error);
        throw AppError_1.AppError.internal('Failed to change password', error);
    }
};
exports.changePassword = changePassword;
// Delete user account
const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { password } = req.body;
        if (!password) {
            throw AppError_1.AppError.badRequest('Password confirmation is required');
        }
        // Get user password
        const [userRows] = await db_1.pool.query('SELECT password, role FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            throw AppError_1.AppError.notFound('User not found');
        }
        const user = userRows[0];
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw AppError_1.AppError.unauthorized('Password is incorrect');
        }
        // Prevent deletion of the last admin
        if (user.role === 'admin') {
            const [adminRows] = await db_1.pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
            const adminCount = adminRows[0].count;
            if (adminCount <= 1) {
                throw AppError_1.AppError.forbidden('Cannot delete the last admin user');
            }
        }
        // Delete user (cascade will handle related records)
        await db_1.pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error deleting user account:', error);
        throw AppError_1.AppError.internal('Failed to delete account', error);
    }
};
exports.deleteUserAccount = deleteUserAccount;
