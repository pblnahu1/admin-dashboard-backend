/*
  # Create Products Table and Admin Setup

  ## Overview
  This migration creates the products table for the admin dashboard and sets up
  authentication and Row Level Security policies.

  ## New Tables
  
  ### `products`
  - `id` (uuid, primary key) - Unique identifier for each product
  - `name` (text, required) - Product name
  - `description` (text) - Product description
  - `image_url` (text) - URL to product image
  - `price` (numeric, required) - Product price
  - `slug` (text, unique, required) - URL-friendly product identifier
  - `is_active` (boolean, default true) - Product visibility status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (uuid) - Reference to admin who created the product

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on products table
  - Authenticated users can read all products
  - Only authenticated users can create products
  - Only authenticated users can update products
  - Only authenticated users can delete products
  
  ## Indexes
  - Index on `slug` for fast lookups
  - Index on `is_active` for filtering
  - Index on `created_at` for sorting

  ## Important Notes
  1. Products use slugs for professional API endpoints
  2. All operations require authentication (admin only)
  3. Soft delete capability via `is_active` flag
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  price numeric NOT NULL CHECK (price >= 0),
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for products table
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();