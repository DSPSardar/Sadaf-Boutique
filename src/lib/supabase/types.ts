/**
 * Row shapes for the catalogue tables (see supabase/migrations/0001_catalogue.sql).
 * Regenerate with `supabase gen types typescript --linked > src/lib/supabase/database.types.ts`
 * once the project is linked if you want the full typed client; these hand-written rows cover
 * everything the app reads and writes today.
 */
export type ProductStatus = "draft" | "active" | "archived";
export type MediaKind = "image" | "video";

export interface CategoryRow {
  id: string;
  slug: string;
  label: string;
  description: string;
  cover_media_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductColorJson {
  name: string;
  family: string;
  hex: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  fabric: string;
  work: string;
  pieces: string[];
  care: string;
  sizes: string[];
  colors: ProductColorJson[];
  occasion: string[];
  tags: string[];
  is_new: boolean;
  featured_rank: number;
  stock: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductMediaRow {
  id: string;
  product_id: string;
  kind: MediaKind;
  storage_path: string;
  poster_media_id: string | null;
  alt: string;
  sort_order: number;
  width: number | null;
  height: number | null;
  blur_data_url: string | null;
  created_at: string;
}

export interface AdminRow {
  user_id: string;
  email: string;
  created_at: string;
}

/** Product row with its media and category slug embedded (as returned by the catalogue queries). */
export interface ProductWithRelations extends ProductRow {
  product_media: ProductMediaRow[];
  categories: { slug: string; label: string } | null;
}
