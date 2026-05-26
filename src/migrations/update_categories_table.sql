-- Update categories table to include all required fields
-- This migration adds missing columns to the existing categories table

-- Add missing columns if they don't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add foreign key constraint for parent_id if it doesn't exist
ALTER TABLE categories 
ADD CONSTRAINT IF NOT EXISTS fk_categories_parent 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active_sort ON categories(is_active, sort_order);
