#!/usr/bin/env tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryManager = void 0;
const db_1 = require("../services/db");
const logger_1 = require("../config/logger");
class CategoryManager {
    async list() {
        try {
            const [rows] = await db_1.pool.query('SELECT id, name, slug, description, sort_order, is_active FROM categories ORDER BY sort_order ASC, name ASC');
            const categories = rows;
            if (categories.length === 0) {
                logger_1.logger.info('📝 No categories found.');
                return;
            }
            logger_1.logger.info('📋 Categories:');
            categories.forEach((cat, index) => {
                const status = cat.is_active ? '✅' : '❌';
                logger_1.logger.info(`  ${index + 1}. ${status} ${cat.name} (${cat.slug}) - Order: ${cat.sort_order}`);
                if (cat.description) {
                    logger_1.logger.info(`     Description: ${cat.description}`);
                }
            });
        }
        catch (error) {
            logger_1.logger.error('❌ Error listing categories:', error);
        }
    }
    async add(name, slug, description) {
        try {
            // Check if category already exists
            const [existing] = await db_1.pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
            if (existing.length > 0) {
                logger_1.logger.error(`❌ Category with slug '${slug}' already exists.`);
                return;
            }
            // Get next sort order
            const [maxOrder] = await db_1.pool.query('SELECT MAX(sort_order) as max_order FROM categories');
            const nextOrder = (maxOrder[0].max_order || 0) + 1;
            // Insert category
            await db_1.pool.query('INSERT INTO categories (name, slug, description, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [name, slug, description || null, nextOrder, true]);
            logger_1.logger.info(`✅ Added category: ${name} (${slug})`);
        }
        catch (error) {
            logger_1.logger.error('❌ Error adding category:', error);
        }
    }
    async remove(slug) {
        try {
            const [result] = await db_1.pool.query('DELETE FROM categories WHERE slug = ?', [slug]);
            const affectedRows = result.affectedRows;
            if (affectedRows > 0) {
                logger_1.logger.info(`✅ Removed category: ${slug}`);
            }
            else {
                logger_1.logger.error(`❌ Category '${slug}' not found.`);
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Error removing category:', error);
        }
    }
    async activate(slug) {
        try {
            const [result] = await db_1.pool.query('UPDATE categories SET is_active = true, updated_at = NOW() WHERE slug = ?', [slug]);
            const affectedRows = result.affectedRows;
            if (affectedRows > 0) {
                logger_1.logger.info(`✅ Activated category: ${slug}`);
            }
            else {
                logger_1.logger.error(`❌ Category '${slug}' not found.`);
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Error activating category:', error);
        }
    }
    async deactivate(slug) {
        try {
            const [result] = await db_1.pool.query('UPDATE categories SET is_active = false, updated_at = NOW() WHERE slug = ?', [slug]);
            const affectedRows = result.affectedRows;
            if (affectedRows > 0) {
                logger_1.logger.info(`✅ Deactivated category: ${slug}`);
            }
            else {
                logger_1.logger.error(`❌ Category '${slug}' not found.`);
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Error deactivating category:', error);
        }
    }
    async reorder(slug, sortOrder) {
        try {
            const [result] = await db_1.pool.query('UPDATE categories SET sort_order = ?, updated_at = NOW() WHERE slug = ?', [sortOrder, slug]);
            const affectedRows = result.affectedRows;
            if (affectedRows > 0) {
                logger_1.logger.info(`✅ Updated sort order for '${slug}' to ${sortOrder}`);
            }
            else {
                logger_1.logger.error(`❌ Category '${slug}' not found.`);
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Error updating sort order:', error);
        }
    }
}
exports.CategoryManager = CategoryManager;
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
                    logger_1.logger.error('❌ Usage: npm run category-cli add "Category Name" "category-slug" [description]');
                    process.exit(1);
                }
                await manager.add(name, slug, description);
                break;
            case 'remove':
                const removeSlug = process.argv[3];
                if (!removeSlug) {
                    logger_1.logger.error('❌ Usage: npm run category-cli remove "category-slug"');
                    process.exit(1);
                }
                await manager.remove(removeSlug);
                break;
            case 'activate':
                const activateSlug = process.argv[3];
                if (!activateSlug) {
                    logger_1.logger.error('❌ Usage: npm run category-cli activate "category-slug"');
                    process.exit(1);
                }
                await manager.activate(activateSlug);
                break;
            case 'deactivate':
                const deactivateSlug = process.argv[3];
                if (!deactivateSlug) {
                    logger_1.logger.error('❌ Usage: npm run category-cli deactivate "category-slug"');
                    process.exit(1);
                }
                await manager.deactivate(deactivateSlug);
                break;
            case 'reorder':
                const reorderSlug = process.argv[3];
                const sortOrder = parseInt(process.argv[4]);
                if (!reorderSlug || isNaN(sortOrder)) {
                    logger_1.logger.error('❌ Usage: npm run category-cli reorder "category-slug" <sort-order>');
                    process.exit(1);
                }
                await manager.reorder(reorderSlug, sortOrder);
                break;
            default:
                logger_1.logger.info('📋 Category CLI Commands:');
                logger_1.logger.info('  list                    - List all categories');
                logger_1.logger.info('  add "Name" "slug" [desc] - Add a new category');
                logger_1.logger.info('  remove "slug"           - Remove a category');
                logger_1.logger.info('  activate "slug"          - Activate a category');
                logger_1.logger.info('  deactivate "slug"       - Deactivate a category');
                logger_1.logger.info('  reorder "slug" <order>  - Update sort order');
                logger_1.logger.info('');
                logger_1.logger.info('Examples:');
                logger_1.logger.info('  npm run category-cli list');
                logger_1.logger.info('  npm run category-cli add "New Category" "new-category" "Description"');
                logger_1.logger.info('  npm run category-cli remove "old-category"');
                logger_1.logger.info('  npm run category-cli reorder "featured-category" 1');
                break;
        }
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('💥 CLI operation failed:', error);
        process.exit(1);
    }
}
// Run if this file is executed directly
if (require.main === module) {
    main();
}
