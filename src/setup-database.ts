// Database Setup Script
// This script helps set up the afristream_db database

import mysql from 'mysql2/promise';
import { env } from './config/env';

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Setting up database...');
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\``);
    console.log(`✅ Database '${env.DB_NAME}' created/verified`);

    // Use the database
    await connection.execute(`USE \`${env.DB_NAME}\``);
    console.log(`✅ Using database '${env.DB_NAME}'`);

    // Create basic tables structure
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        password varchar(255) NOT NULL,
        role enum('admin','editor','contributor','client') DEFAULT 'client',
        status enum('active','inactive','pending','suspended') DEFAULT 'pending',
        phone varchar(20) DEFAULT NULL,
        avatar varchar(500) DEFAULT NULL,
        company varchar(255) DEFAULT NULL,
        location varchar(255) DEFAULT NULL,
        bio text DEFAULT NULL,
        website varchar(255) DEFAULT NULL,
        experience varchar(255) DEFAULT NULL,
        specialties varchar(255) DEFAULT NULL,
        skills text DEFAULT NULL,
        permissions json DEFAULT NULL,
        products_uploaded int(11) DEFAULT 0,
        total_sales decimal(10,2) DEFAULT 0.00,
        join_date datetime DEFAULT CURRENT_TIMESTAMP,
        last_login datetime DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_email (email),
        KEY idx_role (role),
        KEY idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL UNIQUE,
        description text DEFAULT NULL,
        slug varchar(100) NOT NULL UNIQUE,
        parent_id int(11) DEFAULT NULL,
        sort_order int(11) DEFAULT 0,
        is_active tinyint(1) DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_slug (slug),
        KEY idx_parent (parent_id),
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        slug varchar(255) NOT NULL UNIQUE,
        description text DEFAULT NULL,
        short_description varchar(500) DEFAULT NULL,
        price decimal(10,2) NOT NULL,
        sale_price decimal(10,2) DEFAULT NULL,
        sku varchar(100) DEFAULT NULL UNIQUE,
        stock int(11) DEFAULT 0,
        status enum('active','inactive','draft','archived') DEFAULT 'draft',
        category_id int(11) DEFAULT NULL,
        user_id int(11) NOT NULL,
        image_url varchar(500) DEFAULT NULL,
        thumbnail_url varchar(500) DEFAULT NULL,
        gallery json DEFAULT NULL,
        variants json DEFAULT NULL,
        tags json DEFAULT NULL,
        seo_title varchar(255) DEFAULT NULL,
        seo_description varchar(500) DEFAULT NULL,
        download_count int(11) DEFAULT 0,
        view_count int(11) DEFAULT 0,
        rating decimal(3,2) DEFAULT 0.00,
        review_count int(11) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_slug (slug),
        KEY idx_category (category_id),
        KEY idx_user (user_id),
        KEY idx_status (status),
        KEY idx_price (price),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

      -- Insert default categories
      INSERT IGNORE INTO categories (name, description, slug, is_active) VALUES
      ('Templates', 'Website and application templates', 'templates', 1),
      ('Graphics', 'Graphic design assets and resources', 'graphics', 1),
      ('Branding', 'Brand identity and logo design', 'branding', 1),
      ('Web Development', 'Web development services and tools', 'web-development', 1),
      ('Mobile Apps', 'Mobile application development', 'mobile-apps', 1),
      ('Digital Marketing', 'Digital marketing services and tools', 'digital-marketing', 1);

      -- Insert default admin user
      INSERT IGNORE INTO users (name, email, password, role, status, company, join_date) VALUES
      ('Admin User', 'admin@afristream.com', '$2a$12$OWBY.Ovfly7JIaaKP7yVMufYIOE8vumZGUP/H6pEtQSl/vcNH98du', 'admin', 'active', 'Afristream', NOW());
    `;

    await connection.execute(createTablesSQL);
    console.log('✅ Basic tables created successfully');

    console.log('🎉 Database setup completed successfully!');
    console.log(`📊 Database: ${env.DB_NAME}`);
    console.log(`🔗 Host: ${env.DB_HOST}:${env.DB_PORT}`);
    console.log(`👤 User: ${env.DB_USER}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export { setupDatabase };
