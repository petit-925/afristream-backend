"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepo = void 0;
const db_1 = require("../../services/db");
exports.ProductRepo = {
    async findById(id) {
        const [rows] = await db_1.pool.query('SELECT * FROM product WHERE id = ? LIMIT 1', [id]);
        const list = rows;
        return list.length ? list[0] : null;
    },
    async updateById(id, data) {
        const fields = [];
        const values = [];
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.price !== undefined) {
            fields.push('price = ?');
            values.push(data.price);
        }
        if (data.category !== undefined) {
            fields.push('category = ?');
            values.push(data.category);
        }
        if (data.image_url !== undefined) {
            fields.push('image_url = ?');
            values.push(data.image_url);
        }
        if (data.gallery !== undefined) {
            fields.push('gallery = ?');
            values.push(JSON.stringify(data.gallery));
        }
        if (data.frame_options !== undefined) {
            fields.push('frame_options = ?');
            values.push(data.frame_options);
        }
        if (fields.length === 0)
            return 0;
        fields.push('updated_at = NOW()');
        values.push(id);
        const [result] = await db_1.pool.query(`UPDATE product SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows;
    }
};
