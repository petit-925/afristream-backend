import { pool } from '../../services/db';

export interface CategoryRow {
  id: number;
  name: string;
  description?: string | null;
  slug: string;
  parent_id?: number | null;
  sort_order: number;
  is_active: number | boolean;
  created_at: Date;
  updated_at: Date;
}

export const CategoryRepo = {
  async getAllActiveOrdered(): Promise<CategoryRow[]> {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC'
    );
    return rows as CategoryRow[];
  },

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE slug = ? AND is_active = true LIMIT 1',
      [slug]
    );
    const list = rows as CategoryRow[];
    return list.length > 0 ? list[0] : null;
  },

  async create(input: {
    name: string;
    slug: string;
    description?: string | null;
    parent_id?: number | null;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<number> {
    const { name, slug, description = null, parent_id = null, sort_order = 0, is_active = true } = input;
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, slug, description, parent_id, sort_order, is_active]
    );
    return (result as any).insertId as number;
  },

  async deleteById(id: number): Promise<number> {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return (result as any).affectedRows as number;
  }
};


