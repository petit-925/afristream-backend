"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.getCategoryBySlug = exports.getCategories = exports.createCategory = void 0;
const db_1 = require("../../services/db");
// Create category
const createCategory = async (req, res) => {
    try {
        const { name, description, slug, parent_id, sort_order, is_active } = req.body;
        const [result] = await db_1.pool.query("INSERT INTO categories (name, description, slug, parent_id, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)", [name, description, slug, parent_id, sort_order ?? 0, is_active ?? true]);
        res.json({ message: "Category created successfully", categoryId: result.insertId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating category" });
    }
};
exports.createCategory = createCategory;
// Get all active categories ordered by sort_order
const getCategories = async (req, res) => {
    try {
        const [rows] = await db_1.pool.query("SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC");
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching categories" });
    }
};
exports.getCategories = getCategories;
// Get category by slug
const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [rows] = await db_1.pool.query("SELECT * FROM categories WHERE slug = ? AND is_active = true", [slug]);
        const categories = rows;
        if (categories.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(categories[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching category" });
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.pool.query("DELETE FROM categories WHERE id = ?", [id]);
        res.json({ message: "Category deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting category" });
    }
};
exports.deleteCategory = deleteCategory;
