"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { categorySchema, fieldErrors, productSchema } from "@/lib/admin/validation";
import { CATALOG_TAG } from "@/lib/catalog-source";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import type { ProductStatus } from "@/lib/supabase/types";

export interface FormState {
  errors?: Record<string, string>;
  message?: string;
  ok?: boolean;
}

/** Everything the storefront caches is tagged "catalog"; admin pages are re-rendered by path. */
function invalidate(paths: string[] = []) {
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/admin", "layout");
  paths.forEach((p) => revalidatePath(p));
}

export async function saveProduct(productId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const p = parsed.data;
  const row = {
    name: p.name, slug: p.slug, sku: p.sku, category_id: p.categoryId, price: p.price,
    compare_at_price: p.compareAtPrice ?? null, description: p.description, fabric: p.fabric, work: p.work,
    pieces: p.pieces, care: p.care, sizes: p.sizes, colors: p.colors, occasion: p.occasion, tags: p.tags,
    is_new: p.isNew, featured_rank: p.featuredRank, stock: p.stock, status: p.status,
  };
  const supabase = await getServerSupabase();
  const query = productId ? supabase.from("products").update(row).eq("id", productId).select("id").single() : supabase.from("products").insert(row).select("id").single();
  const { data, error } = await query;
  if (error) {
    const dup = error.code === "23505";
    return { errors: dup ? { [error.message.includes("sku") ? "sku" : "slug"]: "Already in use" } : {}, message: dup ? "That slug or SKU already exists." : error.message };
  }
  invalidate();
  if (!productId) redirect(`/admin/products/${data.id}?created=1`);
  return { ok: true, message: "Saved" };
}

export async function setProductStatus(productId: string, status: ProductStatus): Promise<void> {
  await requireAdmin();
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("products").update({ status }).eq("id", productId);
  if (error) throw new Error(error.message);
  invalidate();
}

export async function deleteProduct(productId: string): Promise<void> {
  await requireAdmin();
  const admin = getAdminSupabase();
  const { data: media } = await admin.from("product_media").select("id, storage_path").eq("product_id", productId);
  for (const m of media ?? []) await removeStorageFolder(m.storage_path);
  const { error } = await admin.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  invalidate();
  redirect("/admin/products?deleted=1");
}

async function removeStorageFolder(prefix: string) {
  if (!prefix || prefix === "pending") return;
  const admin = getAdminSupabase();
  const { data: files } = await admin.storage.from(MEDIA_BUCKET).list(prefix);
  if (files?.length) await admin.storage.from(MEDIA_BUCKET).remove(files.map((f) => `${prefix}/${f.name}`));
}

export async function updateMediaAlt(mediaId: string, alt: string): Promise<void> {
  await requireAdmin();
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("product_media").update({ alt: alt.trim().slice(0, 200) }).eq("id", mediaId);
  if (error) throw new Error(error.message);
  invalidate();
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await requireAdmin();
  const admin = getAdminSupabase();
  const { data: m } = await admin.from("product_media").select("storage_path").eq("id", mediaId).maybeSingle();
  // Storage objects may be shared by several seeded products; only remove when no other row points at them.
  if (m) {
    const { count } = await admin.from("product_media").select("id", { count: "exact", head: true }).eq("storage_path", m.storage_path);
    if ((count ?? 0) <= 1) await removeStorageFolder(m.storage_path);
  }
  const { error } = await admin.from("product_media").delete().eq("id", mediaId);
  if (error) throw new Error(error.message);
  invalidate();
}

/** Persists a new order for a product's images; the first id becomes the primary photo. */
export async function reorderMedia(productId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = await getServerSupabase();
  await Promise.all(orderedIds.map((id, i) => supabase.from("product_media").update({ sort_order: i }).eq("id", id).eq("product_id", productId)));
  invalidate();
}

export async function setVideoPoster(videoId: string, posterMediaId: string | null): Promise<void> {
  await requireAdmin();
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("product_media").update({ poster_media_id: posterMediaId }).eq("id", videoId).eq("kind", "video");
  if (error) throw new Error(error.message);
  invalidate();
}

export async function saveCategory(categoryId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const c = parsed.data;
  const row = { label: c.label, slug: c.slug, description: c.description, sort_order: c.sortOrder };
  const supabase = await getServerSupabase();
  const { error } = categoryId ? await supabase.from("categories").update(row).eq("id", categoryId) : await supabase.from("categories").insert(row);
  if (error) return { message: error.code === "23505" ? "That slug already exists." : error.message, errors: error.code === "23505" ? { slug: "Already in use" } : {} };
  invalidate(["/admin/categories"]);
  return { ok: true, message: "Saved" };
}

export async function setCategoryCover(categoryId: string, mediaId: string | null): Promise<void> {
  await requireAdmin();
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("categories").update({ cover_media_id: mediaId }).eq("id", categoryId);
  if (error) throw new Error(error.message);
  invalidate(["/admin/categories"]);
}

export async function deleteCategory(categoryId: string): Promise<FormState> {
  await requireAdmin();
  const supabase = await getServerSupabase();
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", categoryId);
  if (count) return { message: `Move or delete the ${count} product(s) in this category first.` };
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { message: error.message };
  invalidate(["/admin/categories"]);
  return { ok: true, message: "Category deleted" };
}

export async function signOut(): Promise<void> {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
