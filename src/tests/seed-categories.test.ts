import { seedCategories, resetCategories } from '../migrations/seed-categories';
import { pool } from '../services/db';

describe('Category Seeder', () => {
  beforeEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM categories WHERE name LIKE "Test%"');
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM categories WHERE name LIKE "Test%"');
  });

  describe('seedCategories', () => {
    it('should seed default categories when none exist', async () => {
      // Clear all categories first
      await pool.query('DELETE FROM categories');
      
      await seedCategories();
      
      // Check if categories were inserted
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM categories');
      const count = (rows as any[])[0].count;
      
      expect(count).toBeGreaterThan(0);
    });

    it('should not insert categories if they already exist', async () => {
      // Insert a test category first
      await pool.query(
        'INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)',
        ['Test Category', 'test-category', true]
      );
      
      const [beforeRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
      const beforeCount = (beforeRows as any[])[0].count;
      
      await seedCategories();
      
      const [afterRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
      const afterCount = (afterRows as any[])[0].count;
      
      // Count should be the same (seeder should skip existing)
      expect(afterCount).toBe(beforeCount);
    });

    it('should insert categories with correct structure', async () => {
      // Clear all categories first
      await pool.query('DELETE FROM categories');
      
      await seedCategories();
      
      // Check structure of inserted categories
      const [rows] = await pool.query('SELECT * FROM categories LIMIT 1');
      const category = (rows as any[])[0];
      
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('sort_order');
      expect(category).toHaveProperty('is_active');
      expect(category).toHaveProperty('created_at');
      expect(category).toHaveProperty('updated_at');
    });
  });

  describe('resetCategories', () => {
    it('should delete all categories and re-seed', async () => {
      // Insert some test categories
      await pool.query(
        'INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)',
        ['Test Category 1', 'test-category-1', true]
      );
      await pool.query(
        'INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)',
        ['Test Category 2', 'test-category-2', true]
      );
      
      const [beforeRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
      const beforeCount = (beforeRows as any[])[0].count;
      
      await resetCategories();
      
      const [afterRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
      const afterCount = (afterRows as any[])[0].count;
      
      // Should have default categories, not test categories
      expect(afterCount).toBeGreaterThan(0);
      expect(afterCount).not.toBe(beforeCount);
    });
  });
});
