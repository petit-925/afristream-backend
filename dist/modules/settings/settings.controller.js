"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
// Schema expected:
// CREATE TABLE IF NOT EXISTS settings (
//   `key` varchar(100) PRIMARY KEY,
//   `value` json NOT NULL,
//   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );
async function getSettings(_req, res) {
    try {
        await db_1.pool.query('CREATE TABLE IF NOT EXISTS settings (`key` varchar(100) PRIMARY KEY, `value` json NOT NULL, updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
        const [rows] = await db_1.pool.query('SELECT `key`, `value` FROM settings');
        const obj = {};
        for (const r of rows)
            obj[r.key] = r.value;
        res.json(obj);
    }
    catch (error) {
        throw AppError_1.AppError.internal('Failed to load settings', error);
    }
}
async function updateSettings(req, res) {
    try {
        const body = req.body;
        if (!body || typeof body !== 'object')
            throw AppError_1.AppError.badRequest('Invalid settings payload');
        await db_1.pool.query('CREATE TABLE IF NOT EXISTS settings (`key` varchar(100) PRIMARY KEY, `value` json NOT NULL, updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
        const keys = Object.keys(body);
        for (const key of keys) {
            const val = JSON.stringify(body[key] ?? null);
            await db_1.pool.query('INSERT INTO settings (`key`, `value`) VALUES (?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated_at=NOW()', [key, val]);
        }
        // Return merged settings
        const [rows] = await db_1.pool.query('SELECT `key`, `value` FROM settings');
        const obj = {};
        for (const r of rows)
            obj[r.key] = r.value;
        res.json({ message: 'Settings updated successfully', settings: obj });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Failed to update settings', error);
    }
}
