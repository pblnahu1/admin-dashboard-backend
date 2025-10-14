import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  slug: string;
  is_active: boolean;
  sku: string | null;
  stock: number | null;
  track_inventory: boolean | null;
  low_stock_threshold: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};
