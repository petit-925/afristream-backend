import { Request, Response } from "express";
import { pool } from "../../services/db";
import { Category, CategoryCreationAttributes } from "./Category";

// Create category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, slug, parent_id, sort_order, is_active }: CategoryCreationAttributes = req.body;

    const [result] = await pool.query(
      "INSERT INTO categories (name, description, slug, parent_id, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, slug, parent_id, sort_order ?? 0, is_active ?? true]
    );

    res.json({ message: "Category created successfully", categoryId: (result as any).insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating category" });
  }
};

// Get all active categories ordered by sort_order
export const getCategories = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE slug = ? AND is_active = true",
      [slug]
    );
    
    const categories = rows as Category[];
    
    if (categories.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(categories[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching category" });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting category" });
  }
};
