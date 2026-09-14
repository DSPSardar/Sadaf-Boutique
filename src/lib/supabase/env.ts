/** Supabase connection settings. The storefront falls back to the mock catalogue when these are absent. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const MEDIA_BUCKET = "product-media";

export const hasSupabase = (): boolean => SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
