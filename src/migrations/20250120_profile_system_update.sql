-- Profile System Database Schema Update
-- Date: 2025-01-20
-- Description: Updates the database schema to support the new profile system with addresses, wishlist, sessions, and support tickets

-- =============================================
-- 1. UPDATE USERS TABLE
-- =============================================

-- Add new columns to users table (omit AFTER to avoid dependency on existing columns)
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `address` TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `avatar_url` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `two_factor_enabled` BOOLEAN DEFAULT FALSE;

-- Add account_type to separate dashboard vs client users
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `account_type` ENUM('dashboard','client') NOT NULL DEFAULT 'client';

-- Update existing avatar column to avatar_url for consistency, only if `avatar` exists
SET @has_avatar := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'avatar'
);

-- Use conditional execution to avoid errors when `avatar` doesn't exist
SET @sql_copy := IF(@has_avatar > 0, 'UPDATE `users` SET `avatar_url` = `avatar` WHERE `avatar` IS NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql_copy; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql_drop := IF(@has_avatar > 0, 'ALTER TABLE `users` DROP COLUMN `avatar`', 'SELECT 1');
PREPARE stmt2 FROM @sql_drop; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- =============================================
-- 2. CREATE ADDRESSES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `street` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `region` VARCHAR(100) NOT NULL,
  `zip_code` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`),
  CONSTRAINT `fk_addresses_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- 3. UPDATE ORDERS TABLE
-- =============================================

-- Drop existing orders table constraints and recreate with new structure
DROP TABLE IF EXISTS `orders_backup`;
-- Backup only if orders exists
SET @has_orders := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orders'
);
SET @sql_backup := IF(@has_orders > 0, 'CREATE TABLE `orders_backup` AS SELECT * FROM `orders`', 'SELECT 1');
PREPARE s_b FROM @sql_backup; EXECUTE s_b; DEALLOCATE PREPARE s_b;

-- Drop existing orders table (disable FK checks to avoid constraint errors)
SET @fk_old := @@FOREIGN_KEY_CHECKS; SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `orders`;

-- Create new orders table with proper structure
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `shipping_address` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- Restore FK checks
SET FOREIGN_KEY_CHECKS = @fk_old;

-- =============================================
-- 4. CREATE ORDER_ITEMS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- 5. CREATE WISHLIST TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_wishlist_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlist_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- 6. CREATE SESSIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `device` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `last_active` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_last_active` (`last_active`),
  CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- 7. CREATE SUPPORT_TICKETS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
  `priority` ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_support_tickets_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Additional indexes for better performance
-- users indexes
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_email');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_users_email` ON `users` (`email`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_role');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_users_role` ON `users` (`role`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_status');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_users_status` ON `users` (`status`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_account_type');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_users_account_type` ON `users` (`account_type`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- orders
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'orders' AND index_name = 'idx_orders_user_status');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_orders_user_status` ON `orders` (`user_id`, `status`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- order_items
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'order_items' AND index_name = 'idx_order_items_order_product');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_order_items_order_product` ON `order_items` (`order_id`, `product_id`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- wishlist
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'wishlist' AND index_name = 'idx_wishlist_user_created');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_wishlist_user_created` ON `wishlist` (`user_id`, `created_at`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- sessions
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sessions' AND index_name = 'idx_sessions_user_active');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_sessions_user_active` ON `sessions` (`user_id`, `is_active`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- support_tickets
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'support_tickets' AND index_name = 'idx_support_tickets_user_status');
SET @sql := IF(@exists = 0, 'CREATE INDEX `idx_support_tickets_user_status` ON `support_tickets` (`user_id`, `status`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- =============================================
-- 9. INSERT SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample addresses for existing users
INSERT INTO `addresses` (`user_id`, `full_name`, `street`, `city`, `region`, `zip_code`, `phone`, `is_default`) 
SELECT 
  `id`, 
  `name`, 
  COALESCE(`location`, '123 Main Street'), 
  'Accra', 
  'Greater Accra', 
  'GA-001', 
  COALESCE(`phone`, '+233123456789'), 
  TRUE 
FROM `users` 
WHERE `id` IN (1, 6, 7);

-- Insert sample support tickets
INSERT INTO `support_tickets` (`user_id`, `subject`, `message`, `status`, `priority`)
SELECT 6, 'Order Issue', 'My order was not delivered on time', 'Open', 'Medium' FROM DUAL
WHERE EXISTS (SELECT 1 FROM `users` WHERE `id` = 6);

INSERT INTO `support_tickets` (`user_id`, `subject`, `message`, `status`, `priority`)
SELECT 7, 'Account Problem', 'Cannot access my account', 'In Progress', 'High' FROM DUAL
WHERE EXISTS (SELECT 1 FROM `users` WHERE `id` = 7);

-- =============================================
-- 10. CLEANUP
-- =============================================

-- Drop backup table
DROP TABLE IF EXISTS `orders_backup`;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify all tables exist
SHOW TABLES LIKE 'users';
SHOW TABLES LIKE 'addresses';
SHOW TABLES LIKE 'orders';
SHOW TABLES LIKE 'order_items';
SHOW TABLES LIKE 'wishlist';
SHOW TABLES LIKE 'sessions';
SHOW TABLES LIKE 'support_tickets';

-- Verify foreign key constraints
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('addresses', 'orders', 'order_items', 'wishlist', 'sessions', 'support_tickets');

-- =============================================
-- END OF MIGRATION
-- =============================================
