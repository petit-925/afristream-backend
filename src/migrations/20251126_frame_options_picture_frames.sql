-- Add support for frame sizes on picture frame products
-- This migration is **backward compatible**:
-- - Adds a nullable JSON column `frame_options` on the legacy `product` table
-- - Adds an optional `selected_size` column on `order_items` to record chosen size
-- - Does NOT modify or remove any existing columns

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS frame_options JSON NULL;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS selected_size VARCHAR(50) NULL;


