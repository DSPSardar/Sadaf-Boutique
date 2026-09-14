// One-off seed: pushes the mock catalogue and its local renditions into a Supabase project.
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local. Idempotent per SKU.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first");
const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });
const BUCKET = "product-media";
const only = process.argv.includes("--limit") ? Number(process.argv[process.argv.indexOf("--limit") + 1]) : Infinity;

// Load the mock catalogue through tsx so the generator stays the single source of truth.
const json = execSync(
  `npx tsx -e "import { PRODUCTS } from './src/data/products'; import { GENERATED_ASSETS } from './src/data/assets.generated'; console.log(JSON.stringify({ PRODUCTS, GENERATED_ASSETS }))"`,
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
);
const { PRODUCTS, GENERATED_ASSETS } = JSON.parse(json.trim().split("\n").pop());

const { data: categories, error: catErr } = await supabase.from("categories").select("id, slug");
if (catErr) throw catErr;
if (!categories?.length) throw new Error("No categories found — run supabase/seed.sql first");
const categoryId = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

/** Uploads every rendition of a local asset under products/<mediaId>/ and returns the storage key. */
const uploaded = new Map(); // local asset id -> { key, width, height, blur }
async function uploadAsset(assetId, mediaId) {
  const key = `products/${mediaId}`;
  const dir = path.join("public/products", assetId);
  for (const file of fs.readdirSync(dir)) {
    if (!/\.(webp|mp4)$/.test(file)) continue;
    const target = file === "preview.mp4" ? "video.mp4" : file;
    const body = fs.readFileSync(path.join(dir, file));
    const { error } = await supabase.storage.from(BUCKET).upload(`${key}/${target}`, body, {
      contentType: file.endsWith(".mp4") ? "video/mp4" : "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw new Error(`upload ${key}/${target}: ${error.message}`);
  }
  return key;
}

let created = 0, skipped = 0;
for (const p of PRODUCTS.slice(0, only)) {
  const { data: existing } = await supabase.from("products").select("id").eq("sku", p.sku).maybeSingle();
  if (existing) { skipped++; continue; }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug: p.slug, sku: p.sku, name: p.name, category_id: categoryId[p.category],
      price: p.price, compare_at_price: p.compareAtPrice ?? null, description: p.description,
      fabric: p.details.fabric, work: p.details.work, pieces: p.details.pieces, care: p.details.care,
      sizes: p.sizes, colors: p.colors, occasion: p.occasion, tags: p.tags, is_new: p.isNew,
      featured_rank: p.featuredRank, stock: p.stock, status: "active", created_at: p.createdAt,
    })
    .select("id")
    .single();
  if (error) throw new Error(`insert ${p.sku}: ${error.message}`);

  // Images (each product gets its own media rows; storage objects are shared per source asset).
  const imageRowByAsset = {};
  for (const [i, img] of p.images.entries()) {
    const gen = GENERATED_ASSETS[img.assetId];
    const { data: row, error: mErr } = await supabase
      .from("product_media")
      .insert({ product_id: product.id, kind: "image", storage_path: "pending", alt: img.alt, sort_order: i, width: gen.large.width, height: gen.large.height, blur_data_url: gen.blurDataURL })
      .select("id")
      .single();
    if (mErr) throw new Error(`media ${p.sku}: ${mErr.message}`);
    // Reuse the uploaded objects for a source photo across products to keep storage small.
    let key = uploaded.get(img.assetId);
    if (!key) { key = await uploadAsset(img.assetId, row.id); uploaded.set(img.assetId, key); }
    await supabase.from("product_media").update({ storage_path: key }).eq("id", row.id);
    imageRowByAsset[img.assetId] = row.id;
  }
  if (p.video) {
    const key = uploaded.get(p.video.posterAssetId) ?? (await uploadAsset(p.video.posterAssetId, `video-${product.id}`));
    uploaded.set(p.video.posterAssetId, key);
    const { error: vErr } = await supabase.from("product_media").insert({
      product_id: product.id, kind: "video", storage_path: key, poster_media_id: imageRowByAsset[p.video.posterAssetId] ?? null,
      alt: `${p.name} video`, sort_order: 99,
    });
    if (vErr) throw new Error(`video ${p.sku}: ${vErr.message}`);
  }
  created++;
  process.stdout.write(`\r${created} created, ${skipped} skipped`);
}
console.log(`\ndone: ${created} created, ${skipped} skipped, ${uploaded.size} source assets uploaded`);

// Category covers: first active product's primary image per category.
for (const c of categories) {
  const { data: first } = await supabase.from("products").select("id").eq("category_id", c.id).eq("status", "active").order("featured_rank").limit(1).maybeSingle();
  if (!first) continue;
  const { data: media } = await supabase.from("product_media").select("id").eq("product_id", first.id).eq("kind", "image").order("sort_order").limit(1).maybeSingle();
  if (media) await supabase.from("categories").update({ cover_media_id: media.id }).eq("id", c.id);
}
console.log("category covers set");
