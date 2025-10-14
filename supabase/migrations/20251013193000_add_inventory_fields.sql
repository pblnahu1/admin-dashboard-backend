-- Add inventory fields to products: sku, stock, track_inventory, low_stock_threshold
-- Idempotent-friendly migration

-- 1) Add columns if not exist
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS stock integer,
  ADD COLUMN IF NOT EXISTS track_inventory boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer;

-- 2) Backfill defaults
UPDATE products
SET stock = COALESCE(stock, 0),
    track_inventory = COALESCE(track_inventory, false),
    low_stock_threshold = COALESCE(low_stock_threshold, 0)
WHERE stock IS NULL OR track_inventory IS NULL OR low_stock_threshold IS NULL;

-- 3) Useful indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_track_inventory ON products(track_inventory);
