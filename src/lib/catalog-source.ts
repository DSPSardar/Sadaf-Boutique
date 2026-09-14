import { mockCatalog, type CatalogSource } from "@/lib/catalog";
import { supabaseCatalog } from "@/lib/catalog-supabase";
import { hasSupabase } from "@/lib/supabase/env";

/**
 * The catalogue the server renders from. Supabase when the project is configured, otherwise the
 * built-in mock catalogue so the storefront runs without any backend (design reviews, CI, demos).
 */
export const catalog: CatalogSource = hasSupabase() ? supabaseCatalog : mockCatalog;
export const usingMockCatalog = !hasSupabase();

/** Cache tag invalidated by admin mutations (see app/(admin)/admin/actions.ts). */
export const CATALOG_TAG = "catalog";
