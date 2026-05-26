-- Split users into admin_users and client_users
-- Date: 2025-01-21

START TRANSACTION;

-- 1) Create admin_users table
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','editor','contributor') DEFAULT 'admin',
  `status` ENUM('active','inactive','pending','suspended') DEFAULT 'active',
  `phone` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `two_factor_enabled` TINYINT(1) DEFAULT 0,
  `company` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `experience` VARCHAR(255) DEFAULT NULL,
  `specialties` VARCHAR(255) DEFAULT NULL,
  `skills` TEXT DEFAULT NULL,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_admin_email` (`email`),
  KEY `idx_admin_role` (`role`),
  KEY `idx_admin_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2) Create client_users table (Afristream frontend)
CREATE TABLE IF NOT EXISTS `client_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `two_factor_enabled` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_client_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3) Migrate existing data from legacy users table if present
-- Admin-like roles to admin_users
INSERT INTO admin_users (id, name, email, password, role, status, phone, address, avatar_url, two_factor_enabled, company, location, bio, website, experience, specialties, skills, last_login, created_at, updated_at)
SELECT u.id, u.name, u.email, COALESCE(u.password, ''),
       CASE WHEN u.role IN ('admin','editor','contributor') THEN u.role ELSE 'admin' END,
       COALESCE(u.status, 'active'),
       u.phone,
      u.address,
      u.avatar_url,
       COALESCE(u.two_factor_enabled, 0),
       u.company,
       u.location,
       u.bio,
       u.website,
       u.experience,
       u.specialties,
       u.skills,
       u.last_login,
       COALESCE(u.created_at, NOW()),
       COALESCE(u.updated_at, NOW())
FROM users u
WHERE u.role IS NULL OR u.role IN ('admin','editor','contributor');

-- Client role to client_users
INSERT INTO client_users (id, name, email, password, phone, address, avatar_url, two_factor_enabled, created_at, updated_at)
SELECT u.id, u.name, u.email, COALESCE(u.password, ''), u.phone, u.address, u.avatar_url, COALESCE(u.two_factor_enabled, 0), COALESCE(u.created_at, NOW()), COALESCE(u.updated_at, NOW())
FROM users u
WHERE u.role = 'client';

-- 4) Optional: Keep legacy users for compatibility, or drop after code is updated
-- DROP TABLE users; -- Uncomment only after code fully migrates to new tables

COMMIT;


