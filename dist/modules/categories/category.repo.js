"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepo = void 0;
const db_1 = require("../../services/db");
exports.CategoryRepo = {
    async getAllActiveOrdered() {
        const [rows] = await db_1.pool.query('SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC');
        return rows;
    },
    async findBySlug(slug) {
        const [rows] = await db_1.pool.query('SELECT * FROM categories WHERE slug = ? AND is_active = true LIMIT 1', [slug]);
        const list = rows;
        return list.length > 0 ? list[0] : null;
    },
    async create(input) {
        const { name, slug, description = null, parent_id = null, sort_order = 0, is_active = true } = input;
        const [result] = await db_1.pool.query('INSERT INTO categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', [name, slug, description, parent_id, sort_order, is_active]);
        return result.insertId;
    },
    async deleteById(id) {
        const [result] = await db_1.pool.query('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
};
