"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicket = exports.createTicket = exports.getTicketById = exports.getUserTickets = void 0;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
// Get user support tickets
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const [rows] = await db_1.pool.query('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching user tickets:', error);
        throw AppError_1.AppError.internal('Failed to fetch support tickets', error);
    }
};
exports.getUserTickets = getUserTickets;
// Get single support ticket
const getTicketById = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        const [rows] = await db_1.pool.query('SELECT * FROM support_tickets WHERE id = ? AND user_id = ?', [id, userId]);
        if (rows.length === 0) {
            throw AppError_1.AppError.notFound('Support ticket not found or does not belong to user');
        }
        res.json(rows[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching support ticket:', error);
        throw AppError_1.AppError.internal('Failed to fetch support ticket', error);
    }
};
exports.getTicketById = getTicketById;
// Create new support ticket
const createTicket = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { subject, message, priority = 'Medium' } = req.body;
        if (!subject || !message) {
            throw AppError_1.AppError.badRequest('Subject and message are required');
        }
        const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
        if (!validPriorities.includes(priority)) {
            throw AppError_1.AppError.badRequest('Invalid priority level');
        }
        const [result] = await db_1.pool.query('INSERT INTO support_tickets (user_id, subject, message, priority) VALUES (?, ?, ?, ?)', [userId, subject, message, priority]);
        const insertId = result.insertId;
        // Fetch the created ticket
        const [rows] = await db_1.pool.query('SELECT * FROM support_tickets WHERE id = ?', [insertId]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error creating support ticket:', error);
        throw AppError_1.AppError.internal('Failed to create support ticket', error);
    }
};
exports.createTicket = createTicket;
// Update support ticket (user can only update their own tickets)
const updateTicket = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        const { subject, message } = req.body;
        // Check if ticket belongs to user
        const [existingRows] = await db_1.pool.query('SELECT id, status FROM support_tickets WHERE id = ? AND user_id = ?', [id, userId]);
        if (existingRows.length === 0) {
            throw AppError_1.AppError.notFound('Support ticket not found or does not belong to user');
        }
        const ticket = existingRows[0];
        // Only allow updates if ticket is not closed
        if (ticket.status === 'Closed') {
            throw AppError_1.AppError.forbidden('Cannot update closed ticket');
        }
        const updates = [];
        const values = [];
        if (subject !== undefined) {
            updates.push('subject = ?');
            values.push(subject);
        }
        if (message !== undefined) {
            updates.push('message = ?');
            values.push(message);
        }
        if (updates.length === 0) {
            throw AppError_1.AppError.badRequest('No valid fields to update');
        }
        updates.push('updated_at = NOW()');
        values.push(id);
        const query = `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`;
        await db_1.pool.query(query, values);
        // Fetch updated ticket
        const [updatedRows] = await db_1.pool.query('SELECT * FROM support_tickets WHERE id = ?', [id]);
        res.json(updatedRows[0]);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error updating support ticket:', error);
        throw AppError_1.AppError.internal('Failed to update support ticket', error);
    }
};
exports.updateTicket = updateTicket;
