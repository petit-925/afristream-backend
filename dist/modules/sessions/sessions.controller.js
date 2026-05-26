"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTwoFactor = exports.logoutAllOtherSessions = exports.logoutSession = exports.getUserSessions = void 0;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
// Get user sessions
const getUserSessions = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const [rows] = await db_1.pool.query('SELECT * FROM sessions WHERE user_id = ? AND is_active = TRUE ORDER BY last_active DESC', [userId]);
        res.json(rows);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching user sessions:', error);
        throw AppError_1.AppError.internal('Failed to fetch sessions', error);
    }
};
exports.getUserSessions = getUserSessions;
// Log out from specific session
const logoutSession = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        // Check if session belongs to user
        const [existingRows] = await db_1.pool.query('SELECT id FROM sessions WHERE id = ? AND user_id = ?', [id, userId]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('Session not found or does not belong to user');
        }
        await db_1.pool.query('UPDATE sessions SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Session logged out successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error logging out session:', error);
        throw AppError_1.AppError.internal('Failed to logout session', error);
    }
};
exports.logoutSession = logoutSession;
// Log out from all other sessions (except current)
const logoutAllOtherSessions = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const currentSessionId = req.sessionId; // This would need to be set by middleware
        if (currentSessionId) {
            await db_1.pool.query('UPDATE sessions SET is_active = FALSE, updated_at = NOW() WHERE user_id = ? AND id != ?', [userId, currentSessionId]);
        }
        else {
            await db_1.pool.query('UPDATE sessions SET is_active = FALSE, updated_at = NOW() WHERE user_id = ?', [userId]);
        }
        res.json({ message: 'All other sessions logged out successfully' });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error logging out all sessions:', error);
        throw AppError_1.AppError.internal('Failed to logout all sessions', error);
    }
};
exports.logoutAllOtherSessions = logoutAllOtherSessions;
// Toggle Two-Factor Authentication
const toggleTwoFactor = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { enabled } = req.body;
        if (typeof enabled !== 'boolean') {
            throw AppError_1.AppError.badRequest('Enabled field must be a boolean');
        }
        await db_1.pool.query('UPDATE users SET two_factor_enabled = ?, updated_at = NOW() WHERE id = ?', [enabled, userId]);
        res.json({
            message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
            two_factor_enabled: enabled
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error toggling two-factor authentication:', error);
        throw AppError_1.AppError.internal('Failed to toggle two-factor authentication', error);
    }
};
exports.toggleTwoFactor = toggleTwoFactor;
