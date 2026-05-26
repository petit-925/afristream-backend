import { pool } from '../../services/db';

export interface ProductRow {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  image_url?: string | null;
  gallery?: string | null; // JSON string in DB
  frame_options?: string | null; // JSON string in DB for picture frame sizes
  created_at: Date;
  updated_at: Date;
}

export const ProductRepo = {
  async findById(id: number): Promise<ProductRow | null> {
    const [rows] = await pool.query('SELECT * FROM product WHERE id = ? LIMIT 1', [id]);
    const list = rows as ProductRow[];
    return list.length ? list[0] : null;
  },

  async updateById(id: number, data: Partial<ProductRow> & { gallery?: string[] }): Promise<number> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if ((data as any).image_url !== undefined) { fields.push('image_url = ?'); values.push((data as any).image_url); }
    if (data.gallery !== undefined) { fields.push('gallery = ?'); values.push(JSON.stringify(data.gallery)); }
    if ((data as any).frame_options !== undefined) {
      fields.push('frame_options = ?');
      values.push((data as any).frame_options);
    }

    if (fields.length === 0) return 0;

    fields.push('updated_at = NOW()');
    values.push(id);

    const [result] = await pool.query(
      `UPDATE product SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return (result as any).affectedRows as number;
  }
};


