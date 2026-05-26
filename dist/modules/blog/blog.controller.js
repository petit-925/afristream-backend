"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPosts = listPosts;
exports.createPost = createPost;
exports.getBlogStats = getBlogStats;
const db_1 = require("../../services/db");
async function listPosts(_req, res) {
    const [rows] = await db_1.pool.query('SELECT id, user_id AS user_id, title, content, created_at AS created_at, updated_at AS updated_at FROM blog_posts ORDER BY created_at DESC');
    res.json(rows);
}
async function createPost(req, res) {
    const { user_id, title, content } = req.body;
    const now = new Date();
    const [result] = await db_1.pool.query('INSERT INTO blog_posts (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [user_id, title, content, now, now]);
    const insertId = result.insertId;
    const [rows] = await db_1.pool.query('SELECT * FROM blog_posts WHERE id = ?', [insertId]);
    res.status(201).json(Array.isArray(rows) ? rows[0] : rows);
}
async function getBlogStats(_req, res) {
    try {
        const [rows] = await db_1.pool.query('SELECT * FROM blog_posts');
        const posts = Array.isArray(rows) ? rows : [];
        const totalPosts = posts.length;
        const publishedPosts = posts.filter((p) => (p.status || '').toLowerCase() === 'published').length;
        const draftPosts = posts.filter((p) => (p.status || '').toLowerCase() === 'draft').length;
        const scheduledPosts = posts.filter((p) => (p.status || '').toLowerCase() === 'scheduled').length;
        const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
        res.json({
            totalPosts,
            publishedPosts,
            draftPosts,
            scheduledPosts,
            totalViews
        });
    }
    catch (error) {
        console.error('Error fetching blog stats:', error);
        res.status(500).json({ message: 'Error fetching blog stats' });
    }
}
