import { pool } from '../services/db';
import { logger } from '../config/logger';

// Default categories to seed
const defaultCategories = [
  {
    name: 'Picture Frames',
    slug: 'picture-frames',
    description: 'Custom picture frames and photo displays',
    sort_order: 1,
    is_active: true
  },
  {
    name: 'Apps',
    slug: 'apps',
    description: 'Mobile and web applications',
    sort_order: 2,
    is_active: true
  },
  {
    name: 'Phones',
    slug: 'phones',
    description: 'Phone accessories and cases',
    sort_order: 3,
    is_active: true
  },
  {
    name: 'Web Designs',
    slug: 'web-designs',
    description: 'Website design and development services',
    sort_order: 4,
    is_active: true
  },
  {
    name: 'Logos',
    slug: 'logos',
    description: 'Logo design and branding services',
    sort_order: 5,
    is_active: true
  },
  {
    name: 'Graphics Design',
    slug: 'graphics-design',
    description: 'Graphic design and visual content creation',
    sort_order: 6,
    is_active: true
  },
  {
    name: 'Branding',
    slug: 'branding',
    description: 'Complete branding and identity design',
    sort_order: 7,
    is_active: true
  },
  {
    name: 'Art & Paints',
    slug: 'art-paint',
    description: 'Artwork and painting services',
    sort_order: 8,
    is_active: true
  },
  {
    name: 'Videos & Pictures',
    slug: 'videos-pictures',
    description: 'Video production and photography services',
    sort_order: 9,
    is_active: true
  }
];

async function seedCategories() {
  try {
    logger.info('🌱 Starting category seeding...');
    
    // Check if categories already exist
    const [existingCategories] = await pool.query(
      'SELECT COUNT(*) as count FROM categories'
    );
    
    const categoryCount = (existingCategories as any[])[0].count;
    
    if (categoryCount > 0) {
      logger.info(`📊 Found ${categoryCount} existing categories. Skipping seeding.`);
      return;
    }
    
    logger.info('📝 No existing categories found. Proceeding with seeding...');
    
    // Insert categories one by one to handle potential conflicts
    let insertedCount = 0;
    
    for (const category of defaultCategories) {
      try {
        // Check if category with this slug already exists
        const [existing] = await pool.query(
          'SELECT id FROM categories WHERE slug = ?',
          [category.slug]
        );
        
        if ((existing as any[]).length > 0) {
          logger.info(`⏭️  Category '${category.name}' already exists. Skipping.`);
          continue;
        }
        
        // Insert the category
        await pool.query(
          `INSERT INTO categories (name, slug, description, sort_order, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            category.name,
            category.slug,
            category.description,
            category.sort_order,
            category.is_active
          ]
        );
        
        insertedCount++;
        logger.info(`✅ Inserted category: ${category.name} (${category.slug})`);
        
      } catch (error: any) {
        logger.error(`❌ Error inserting category '${category.name}':`, error);
        // Continue with other categories even if one fails
      }
    }
    
    logger.info(`🎉 Category seeding completed! Inserted ${insertedCount} categories.`);
    
    // Verify the seeding
    const [finalCount] = await pool.query('SELECT COUNT(*) as count FROM categories');
    const totalCategories = (finalCount as any[])[0].count;
    logger.info(`📊 Total categories in database: ${totalCategories}`);
    
  } catch (error: any) {
    logger.error('❌ Error during category seeding:', error);
    throw error;
  }
}

async function resetCategories() {
  try {
    logger.info('🗑️  Resetting categories...');
    
    // Delete all categories
    await pool.query('DELETE FROM categories');
    
    logger.info('✅ All categories deleted.');
    
    // Re-seed
    await seedCategories();
    
  } catch (error: any) {
    logger.error('❌ Error resetting categories:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'reset':
        await resetCategories();
        break;
      case 'seed':
      default:
        await seedCategories();
        break;
    }
    
    logger.info('🏁 Seeding process completed successfully!');
    process.exit(0);
    
  } catch (error: any) {
    logger.error('💥 Seeding process failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { seedCategories, resetCategories };
