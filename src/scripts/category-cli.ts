#!/usr/bin/env tsx

import { pool } from '../services/db';
import { logger } from '../config/logger';

interface CategoryCLI {
  list(): Promise<void>;
  add(name: string, slug: string, description?: string): Promise<void>;
  remove(slug: string): Promise<void>;
  activate(slug: string): Promise<void>;
  deactivate(slug: string): Promise<void>;
  reorder(slug: string, sortOrder: number): Promise<void>;
}

class CategoryManager implements CategoryCLI {
  async list(): Promise<void> {
    try {
      const [rows] = await pool.query(
        'SELECT id, name, slug, description, sort_order, is_active FROM categories ORDER BY sort_order ASC, name ASC'
      );
      
      const categories = rows as any[];
      
      if (categories.length === 0) {
        logger.info('📝 No categories found.');
        return;
      }
      
      logger.info('📋 Categories:');
      categories.forEach((cat, index) => {
        const status = cat.is_active ? '✅' : '❌';
        logger.info(`  ${index + 1}. ${status} ${cat.name} (${cat.slug}) - Order: ${cat.sort_order}`);
        if (cat.description) {
          logger.info(`     Description: ${cat.description}`);
        }
      });
      
    } catch (error: any) {
      logger.error('❌ Error listing categories:', error);
    }
  }

  async add(name: string, slug: string, description?: string): Promise<void> {
    try {
      // Check if category already exists
      const [existing] = await pool.query(
        'SELECT id FROM categories WHERE slug = ?',
        [slug]
      );
      
      if ((existing as any[]).length > 0) {
        logger.error(`❌ Category with slug '${slug}' already exists.`);
        return;
      }
      
      // Get next sort order
      const [maxOrder] = await pool.query('SELECT MAX(sort_order) as max_order FROM categories');
      const nextOrder = ((maxOrder as any[])[0].max_order || 0) + 1;
      
      // Insert category
      await pool.query(
        'INSERT INTO categories (name, slug, description, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [name, slug, description || null, nextOrder, true]
      );
      
      logger.info(`✅ Added category: ${name} (${slug})`);
      
    } catch (error: any) {
      logger.error('❌ Error adding category:', error);
    }
  }

  async remove(slug: string): Promise<void> {
    try {
      const [result] = await pool.query('DELETE FROM categories WHERE slug = ?', [slug]);
      const affectedRows = (result as any).affectedRows;
      
      if (affectedRows > 0) {
        logger.info(`✅ Removed category: ${slug}`);
      } else {
        logger.error(`❌ Category '${slug}' not found.`);
      }
      
    } catch (error: any) {
      logger.error('❌ Error removing category:', error);
    }
  }

  async activate(slug: string): Promise<void> {
    try {
      const [result] = await pool.query(
        'UPDATE categories SET is_active = true, updated_at = NOW() WHERE slug = ?',
        [slug]
      );
      
      const affectedRows = (result as any).affectedRows;
      
      if (affectedRows > 0) {
        logger.info(`✅ Activated category: ${slug}`);
      } else {
        logger.error(`❌ Category '${slug}' not found.`);
      }
      
    } catch (error: any) {
      logger.error('❌ Error activating category:', error);
    }
  }

  async deactivate(slug: string): Promise<void> {
    try {
      const [result] = await pool.query(
        'UPDATE categories SET is_active = false, updated_at = NOW() WHERE slug = ?',
        [slug]
      );
      
      const affectedRows = (result as any).affectedRows;
      
      if (affectedRows > 0) {
        logger.info(`✅ Deactivated category: ${slug}`);
      } else {
        logger.error(`❌ Category '${slug}' not found.`);
      }
      
    } catch (error: any) {
      logger.error('❌ Error deactivating category:', error);
    }
  }

  async reorder(slug: string, sortOrder: number): Promise<void> {
    try {
      const [result] = await pool.query(
        'UPDATE categories SET sort_order = ?, updated_at = NOW() WHERE slug = ?',
        [sortOrder, slug]
      );
      
      const affectedRows = (result as any).affectedRows;
      
      if (affectedRows > 0) {
        logger.info(`✅ Updated sort order for '${slug}' to ${sortOrder}`);
      } else {
        logger.error(`❌ Category '${slug}' not found.`);
      }
      
    } catch (error: any) {
      logger.error('❌ Error updating sort order:', error);
    }
  }
}

// CLI Interface
async function main() {
  const manager = new CategoryManager();
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'list':
        await manager.list();
        break;
        
      case 'add':
        const name = process.argv[3];
        const slug = process.argv[4];
        const description = process.argv[5];
        
        if (!name || !slug) {
          logger.error('❌ Usage: npm run category-cli add "Category Name" "category-slug" [description]');
          process.exit(1);
        }
        
        await manager.add(name, slug, description);
        break;
        
      case 'remove':
        const removeSlug = process.argv[3];
        
        if (!removeSlug) {
          logger.error('❌ Usage: npm run category-cli remove "category-slug"');
          process.exit(1);
        }
        
        await manager.remove(removeSlug);
        break;
        
      case 'activate':
        const activateSlug = process.argv[3];
        
        if (!activateSlug) {
          logger.error('❌ Usage: npm run category-cli activate "category-slug"');
          process.exit(1);
        }
        
        await manager.activate(activateSlug);
        break;
        
      case 'deactivate':
        const deactivateSlug = process.argv[3];
        
        if (!deactivateSlug) {
          logger.error('❌ Usage: npm run category-cli deactivate "category-slug"');
          process.exit(1);
        }
        
        await manager.deactivate(deactivateSlug);
        break;
        
      case 'reorder':
        const reorderSlug = process.argv[3];
        const sortOrder = parseInt(process.argv[4]);
        
        if (!reorderSlug || isNaN(sortOrder)) {
          logger.error('❌ Usage: npm run category-cli reorder "category-slug" <sort-order>');
          process.exit(1);
        }
        
        await manager.reorder(reorderSlug, sortOrder);
        break;
        
      default:
        logger.info('📋 Category CLI Commands:');
        logger.info('  list                    - List all categories');
        logger.info('  add "Name" "slug" [desc] - Add a new category');
        logger.info('  remove "slug"           - Remove a category');
        logger.info('  activate "slug"          - Activate a category');
        logger.info('  deactivate "slug"       - Deactivate a category');
        logger.info('  reorder "slug" <order>  - Update sort order');
        logger.info('');
        logger.info('Examples:');
        logger.info('  npm run category-cli list');
        logger.info('  npm run category-cli add "New Category" "new-category" "Description"');
        logger.info('  npm run category-cli remove "old-category"');
        logger.info('  npm run category-cli reorder "featured-category" 1');
        break;
    }
    
    process.exit(0);
    
  } catch (error: any) {
    logger.error('💥 CLI operation failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { CategoryManager };
