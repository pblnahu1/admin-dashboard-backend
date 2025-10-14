-- Add user_id column, indexes, unique constraints, and tenant-isolated RLS policies
-- This migration is idempotent where possible.

-- 1) Column and FK
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE products
  ADD CONSTRAINT IF NOT EXISTS products_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2) Backfill user_id from created_by if missing
UPDATE products
SET user_id = COALESCE(user_id, created_by)
WHERE user_id IS NULL;

-- 3) Optional: enforce NOT NULL going forward
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'user_id'
  ) THEN
    BEGIN
      ALTER TABLE products ALTER COLUMN user_id SET NOT NULL;
    EXCEPTION WHEN others THEN
      -- Skip if existing nulls or permissions prevent the change; handle manually if needed
      NULL;
    END;
  END IF;
END $$;

-- 4) Indexes for performance and uniqueness per tenant
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
-- Drop global unique constraint on slug (name is usually products_slug_key)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products' AND constraint_name = 'products_slug_key'
  ) THEN
    ALTER TABLE products DROP CONSTRAINT products_slug_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_products_user_slug ON products(user_id, slug);

-- 5) Replace RLS policies with tenant-isolated versions
-- Drop old policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Anyone can view active products'
  ) THEN
    DROP POLICY "Anyone can view active products" ON products;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can view all products'
  ) THEN
    DROP POLICY "Authenticated users can view all products" ON products;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can create products'
  ) THEN
    DROP POLICY "Authenticated users can create products" ON products;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can update products'
  ) THEN
    DROP POLICY "Authenticated users can update products" ON products;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can delete products'
  ) THEN
    DROP POLICY "Authenticated users can delete products" ON products;
  END IF;
END $$;

-- Public read of active products (for public-facing endpoints, optional)
CREATE POLICY IF NOT EXISTS "Public can view active products"
  ON products FOR SELECT TO anon
  USING (is_active = true);

-- Tenant-isolated read
CREATE POLICY IF NOT EXISTS "Users can read own products"
  ON products FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Tenant-isolated insert: must insert with own user_id
CREATE POLICY IF NOT EXISTS "Users can insert own products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Tenant-isolated update: only modify own rows
CREATE POLICY IF NOT EXISTS "Users can update own products"
  ON products FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Tenant-isolated delete: only own rows
CREATE POLICY IF NOT EXISTS "Users can delete own products"
  ON products FOR DELETE TO authenticated
  USING (user_id = auth.uid());
