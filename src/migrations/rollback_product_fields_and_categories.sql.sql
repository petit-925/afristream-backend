ALTER TABLE products DROP FOREIGN KEY fk_products_category;

ALTER TABLE products
  DROP COLUMN stock,
  DROP COLUMN status,
  DROP COLUMN seo_title,
  DROP COLUMN seo_description,
  DROP COLUMN category_id,
  DROP COLUMN slug;

DROP TABLE IF EXISTS categories;
