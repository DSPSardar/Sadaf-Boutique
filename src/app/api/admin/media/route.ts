import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAdminSession } from "@/lib/admin/auth";
import { buildRenditions } from "@/lib/admin/renditions";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { CATALOG_TAG } from "@/lib/catalog-source";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_VIDEO = 25 * 1024 * 1024;

/**
 * POST multipart/form-data { productId, file, alt?, posterMediaId? }
 * Images: renditions are generated here and uploaded under products/<mediaId>/. Videos: stored as video.mp4.
 * Runs with the service-role client after the caller is verified as an admin.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const productId = String(form.get("productId") ?? "");
  const alt = String(form.get("alt") ?? "");
  const posterMediaId = form.get("posterMediaId") ? String(form.get("posterMediaId")) : null;
  if (!(file instanceof File) || !productId) return NextResponse.json({ error: "file and productId are required" }, { status: 400 });

  const isVideo = file.type === "video/mp4";
  const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!isVideo && !isImage) return NextResponse.json({ error: "Upload a JPG, PNG, WebP or MP4" }, { status: 415 });
  if (file.size > (isVideo ? MAX_VIDEO : MAX_IMAGE)) return NextResponse.json({ error: "File is too large" }, { status: 413 });

  const supabase = getAdminSupabase();
  const { data: product, error: pErr } = await supabase.from("products").select("id, name").eq("id", productId).maybeSingle();
  if (pErr || !product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const { count } = await supabase.from("product_media").select("id", { count: "exact", head: true }).eq("product_id", productId);

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data: row, error: insErr } = await supabase
    .from("product_media")
    .insert({ product_id: productId, kind: isVideo ? "video" : "image", storage_path: "pending", alt: alt || product.name, sort_order: isVideo ? 99 : count ?? 0, poster_media_id: isVideo ? posterMediaId : null })
    .select("*")
    .single();
  if (insErr || !row) return NextResponse.json({ error: insErr?.message ?? "Could not create media" }, { status: 500 });

  const key = `products/${row.id}`;
  try {
    if (isVideo) {
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(`${key}/video.mp4`, buffer, { contentType: "video/mp4", upsert: true, cacheControl: "31536000" });
      if (error) throw new Error(error.message);
      await supabase.from("product_media").update({ storage_path: key }).eq("id", row.id);
    } else {
      const set = await buildRenditions(buffer);
      for (const f of set.files) {
        const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(`${key}/${f.name}`, f.body, { contentType: f.contentType, upsert: true, cacheControl: "31536000" });
        if (error) throw new Error(error.message);
      }
      await supabase.from("product_media").update({ storage_path: key, width: set.width, height: set.height, blur_data_url: set.blurDataURL }).eq("id", row.id);
    }
  } catch (e) {
    await supabase.from("product_media").delete().eq("id", row.id);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }

  revalidateTag(CATALOG_TAG, "max");
  const { data: saved } = await supabase.from("product_media").select("*").eq("id", row.id).single();
  return NextResponse.json({ media: saved });
}
