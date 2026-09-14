import { CATEGORIES } from "@/data/categories";
import type { CatalogSource } from "@/lib/catalog";
import { filterProducts, sortProducts } from "@/lib/catalog";
import { mediaBase } from "@/lib/media";
import { getPublicSupabase } from "@/lib/supabase/server";
import type { CategoryRow, ProductMediaRow, ProductWithRelations } from "@/lib/supabase/types";
import type { Category, Product, ProductImage } from "@/types/product";
import type { ColorFamily } from "@/data/assets";

export const PRODUCT_SELECT = "*, product_media(*), categories(slug, label)";

/** Maps a database row (with media + category embedded) to the storefront Product shape. */
export function rowToProduct(row: ProductWithRelations): Product {
  const media = [...(row.product_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const images: ProductImage[] = media
    .filter((m) => m.kind === "image")
    .map((m, i) => ({
      assetId: m.storage_path,
      alt: m.alt || (i === 0 ? row.name : `${row.name} — view ${i + 1}`),
      blurDataURL: m.blur_data_url ?? undefined,
      width: m.width ?? undefined,
      height: m.height ?? undefined,
    }));
  const videoRow = media.find((m) => m.kind === "video");
  const poster: ProductMediaRow | undefined = videoRow
    ? media.find((m) => m.id === videoRow.poster_media_id && m.kind === "image") ?? media.find((m) => m.kind === "image")
    : undefined;

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.categories?.slug ?? "",
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    currency: "PKR",
    description: row.description,
    details: { fabric: row.fabric, work: row.work, pieces: row.pieces ?? [], care: row.care },
    colors: (row.colors ?? []).map((c) => ({ name: c.name, family: c.family as ColorFamily, hex: c.hex })),
    sizes: row.sizes ?? [],
    images: images.length ? images : [{ assetId: "0380833b", alt: row.name }],
    video: videoRow && poster ? { src: `${mediaBase(videoRow.storage_path)}/video.mp4`, posterAssetId: poster.storage_path } : undefined,
    isNew: row.is_new,
    featuredRank: row.featured_rank,
    stock: row.stock,
    createdAt: row.created_at,
    occasion: row.occasion ?? [],
    tags: row.tags ?? [],
    status: row.status,
  };
}

export function rowToCategory(row: CategoryRow, coverPath?: string | null): Category {
  const fallback = CATEGORIES.find((c) => c.slug === row.slug)?.coverAssetId ?? "0380833b";
  return { slug: row.slug, label: row.label, description: row.description, coverAssetId: coverPath ?? fallback };
}

async function fetchActiveProducts(): Promise<Product[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("status", "active").order("featured_rank");
  if (error) throw new Error(`catalogue query failed: ${error.message}`);
  return (data as unknown as ProductWithRelations[]).map(rowToProduct);
}

/** Database-backed catalogue. Public reads only (anon key), so results are safe to cache with ISR. */
export const supabaseCatalog: CatalogSource = {
  getProducts: fetchActiveProducts,
  async getProductBySlug(slug) {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("status", "active").maybeSingle();
    if (error) throw new Error(`product query failed: ${error.message}`);
    return data ? rowToProduct(data as unknown as ProductWithRelations) : undefined;
  },
  async getProductsByIds(ids) {
    if (ids.length === 0) return [];
    const supabase = getPublicSupabase();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids).eq("status", "active");
    if (error) throw new Error(`products query failed: ${error.message}`);
    const byId = new Map((data as unknown as ProductWithRelations[]).map((r) => [r.id, rowToProduct(r)]));
    return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  },
  async getCategories() {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase.from("categories").select("*, cover:product_media!categories_cover_media_fk(storage_path)").order("sort_order");
    if (error) throw new Error(`categories query failed: ${error.message}`);
    return (data as unknown as (CategoryRow & { cover: { storage_path: string } | null })[]).map((r) => rowToCategory(r, r.cover?.storage_path));
  },
  async query(q) {
    return sortProducts(filterProducts(await fetchActiveProducts(), q), q.sort);
  },
};
