"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDownloads = listDownloads;
exports.createDownload = createDownload;
const db_1 = require("../../services/db");
async function listDownloads(_req, res) {
    const [rows] = await db_1.pool.query('SELECT id, file_name AS fileName, file_type AS fileType, file_size AS fileSize, download_count AS downloadCount, upload_date AS uploadDate, last_download AS lastDownload, category, status, download_limit AS downloadLimit, expiry_date AS expiryDate, thumbnail_url AS thumbnailUrl, description FROM downloads ORDER BY upload_date DESC');
    res.json(rows);
}
async function createDownload(req, res) {
    const data = req.body;
    const [result] = await db_1.pool.query('INSERT INTO downloads (file_name, file_type, file_size, download_count, upload_date, last_download, category, status, download_limit, expiry_date, thumbnail_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        data.file_name,
        data.file_type || null,
        data.file_size || null,
        data.download_count || 0,
        data.upload_date || new Date(),
        data.last_download || null,
        data.category || null,
        data.status || 'active',
        data.download_limit || null,
        data.expiry_date || null,
        data.thumbnail_url || null,
        data.description || null,
    ]);
    const insertId = result.insertId;
    const [rows] = await db_1.pool.query('SELECT * FROM downloads WHERE id = ?', [insertId]);
    res.status(201).json(Array.isArray(rows) ? rows[0] : rows);
}
