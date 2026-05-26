"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMessages = listMessages;
exports.createMessage = createMessage;
exports.markMessageRead = markMessageRead;
exports.toggleMessageStar = toggleMessageStar;
const db_1 = require("../../services/db");
async function listMessages(_req, res) {
    try {
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NULL,
        recipient_id INT NULL,
        subject VARCHAR(255) NULL,
        content TEXT NULL,
        status VARCHAR(50) NULL,
        priority VARCHAR(50) NULL,
        is_starred TINYINT(1) DEFAULT 0,
        has_attachment TINYINT(1) DEFAULT 0,
        attachment_url VARCHAR(500) NULL,
        project_id INT NULL,
        read_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
        const [rows] = await db_1.pool.query('SELECT id, sender_id AS senderId, recipient_id AS recipientId, content, status, subject, priority, is_starred AS isStarred, has_attachment AS hasAttachment, attachment_url AS attachmentUrl, project_id AS projectId, read_at AS readAt, created_at AS createdAt, updated_at AS updatedAt FROM messages ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (_err) {
        res.json([]);
    }
}
async function createMessage(req, res) {
    const data = req.body;
    const now = new Date();
    const [result] = await db_1.pool.query('INSERT INTO messages (sender_id, recipient_id, content, status, subject, priority, is_starred, has_attachment, attachment_url, project_id, read_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        data.sender_id || null,
        data.recipient_id || null,
        data.content,
        data.status || 'unread',
        data.subject || '',
        data.priority || 'medium',
        data.is_starred ? 1 : 0,
        data.has_attachment ? 1 : 0,
        data.attachment_url || null,
        data.project_id || null,
        data.read_at || null,
        now,
        now,
    ]);
    const insertId = result.insertId;
    const [rows] = await db_1.pool.query('SELECT * FROM messages WHERE id = ?', [insertId]);
    res.status(201).json(Array.isArray(rows) ? rows[0] : rows);
}
async function markMessageRead(req, res) {
    const { id } = req.params;
    await db_1.pool.query('UPDATE messages SET status = "read", read_at = NOW(), updated_at = NOW() WHERE id = ?', [id]);
    const [rows] = await db_1.pool.query('SELECT * FROM messages WHERE id = ?', [id]);
    if (rows.length === 0)
        return res.status(404).json({ message: 'Message not found' });
    res.json(rows[0]);
}
async function toggleMessageStar(req, res) {
    const { id } = req.params;
    // Flip boolean is_starred (0/1)
    await db_1.pool.query('UPDATE messages SET is_starred = IF(is_starred = 1, 0, 1), updated_at = NOW() WHERE id = ?', [id]);
    const [rows] = await db_1.pool.query('SELECT * FROM messages WHERE id = ?', [id]);
    if (rows.length === 0)
        return res.status(404).json({ message: 'Message not found' });
    res.json(rows[0]);
}
