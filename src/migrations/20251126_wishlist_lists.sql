-- Wishlist lists with shareable links
-- Backward compatible: adds new table and nullable list_id on existing wishlist table

CREATE TABLE IF NOT EXISTS wishlist_lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  share_token VARCHAR(64) NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_lists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_wishlist_lists_user (user_id)
);

ALTER TABLE wishlist
  ADD COLUMN IF NOT EXISTS list_id INT NULL,
  ADD CONSTRAINT fk_wishlist_list FOREIGN KEY (list_id) REFERENCES wishlist_lists(id) ON DELETE SET NULL;


