ALTER TABLE products
  ADD COLUMN stock INT DEFAULT 0,
  ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active',
  ADD COLUMN seo_title VARCHAR(255),
  ADD COLUMN seo_description TEXT,
  ADD COLUMN category_id INT,
  ADD COLUMN slug VARCHAR(255) UNIQUE;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products
  ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
-- Note: Ensure to backfill existing products with appropriate category_id and slug values as needed.