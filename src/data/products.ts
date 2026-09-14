import { ASSETS, LOOKS, VIDEO_ASSETS, type ColorFamily, type Look, type PhotoAsset } from "@/data/assets";
import { createRng } from "@/lib/seed";
import { slugify } from "@/lib/slug";
import type { Product, ProductColor, ProductImage } from "@/types/product";

/**
 * Deterministic mock catalogue. Every product is built from the boutique's real photography;
 * the 37 photos are shared across ~120 products (as colourways / variants) so the dense grid,
 * filters and search can be exercised realistically. Replace this module with an API-backed
 * CatalogSource (see lib/catalog.ts) when a backend exists.
 */

const NAMES = [
  "Mahnoor", "Zarnish", "Anaya", "Mehrunnisa", "Sehrish", "Laila", "Noor", "Aiza", "Rania", "Zoya",
  "Hania", "Amal", "Meher", "Inaya", "Sadaf", "Nayab", "Farah", "Gulnaar", "Mishal", "Sana",
  "Rukhsar", "Shanzay", "Elaf", "Areeba", "Dua", "Hoorain", "Kinza", "Manahil", "Nimra", "Rida",
  "Sabeen", "Tabeer", "Urwa", "Wania", "Yumna", "Zainab", "Alishba", "Bakhtawar", "Eshal", "Fiza",
];

const EDITIONS = ["", "", "", "Signature", "Heritage", "Luxe", "Atelier", "Couture", "Festive Edit", "Unstitched"];

const COLOR_META: Record<ColorFamily, { name: string; hex: string }> = {
  red: { name: "Scarlet", hex: "#8B1A1A" },
  maroon: { name: "Deep Maroon", hex: "#5C1A2B" },
  gold: { name: "Champagne Gold", hex: "#C9A96A" },
  blue: { name: "Royal Blue", hex: "#1F3A93" },
  navy: { name: "Midnight Navy", hex: "#1B2A4A" },
  teal: { name: "Teal", hex: "#157A7A" },
  pink: { name: "Rose Pink", hex: "#D6708F" },
  blush: { name: "Blush", hex: "#E8B4B8" },
  orange: { name: "Tangerine", hex: "#E06A2B" },
  silver: { name: "Silver Grey", hex: "#B8BCC4" },
  multi: { name: "Multicolour", hex: "#9C6B8F" },
};

export const COLOR_FAMILIES = Object.keys(COLOR_META) as ColorFamily[];
export const COLOR_OPTIONS = COLOR_FAMILIES.map((family) => ({ family, ...COLOR_META[family] }));
export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "Custom"] as const;

/** How many products each look contributes (sums to 120). */
const PRODUCTS_PER_LOOK: Record<Look["id"], number> = {
  "gold-tissue": 14,
  "royal-blue-silk": 16,
  "red-velvet-bridal": 16,
  "maroon-gharara": 8,
  "pink-lehenga": 12,
  "blush-net-bridal": 8,
  "mehndi-lehenga": 10,
  "silver-tissue-pair": 8,
  "teal-silk": 10,
  "navy-kameez": 8,
  "festive-rack": 10,
};

const CARE = "Dry clean only. Store flat in the provided muslin cover away from direct sunlight.";
const BASE_DATE = Date.UTC(2026, 8, 10); // catalogue "now" for createdAt offsets

function roundPrice(n: number): number {
  return Math.round(n / 500) * 500;
}

function buildDescription(look: Look, colorName: string, edition: string): string {
  const occ = look.occasion.join(" and ").toLowerCase();
  const editionNote = edition === "Unstitched" ? " Supplied unstitched with all embellished panels ready for tailoring." : "";
  return `${colorName} ${look.garment.toLowerCase()} in ${look.fabric.toLowerCase()}, finished with ${look.work.toLowerCase()}. Designed for ${occ} occasions and made in our Lahore atelier.${editionNote}`;
}

function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr;
  const o = offset % arr.length;
  return [...arr.slice(o), ...arr.slice(0, o)];
}

function generate(): Product[] {
  const rng = createRng(20260910);
  const products: Product[] = [];
  const videoSet = new Set<string>(VIDEO_ASSETS);
  let serial = 1;

  LOOKS.forEach((look, lookIndex) => {
    const assets = ASSETS.filter((a) => a.look === look.id);
    const primaries = assets.filter((a) => a.shot === "full" || a.shot === "model");
    const primaryPool: PhotoAsset[] = primaries.length ? primaries : assets;
    const count = PRODUCTS_PER_LOOK[look.id];

    for (let i = 0; i < count; i++) {
      const name = NAMES[(lookIndex * 7 + i * 3) % NAMES.length];
      const edition = EDITIONS[(lookIndex + i) % EDITIONS.length];
      const primaryFamily = look.colors[i % look.colors.length];
      const primaryColor: ProductColor = { family: primaryFamily, ...COLOR_META[primaryFamily] };
      const colors: ProductColor[] = [primaryColor];
      for (const f of look.colors) {
        if (f !== primaryFamily) colors.push({ family: f, ...COLOR_META[f] });
      }
      if (rng.chance(0.35)) {
        const extra = rng.pick(COLOR_FAMILIES.filter((f) => f !== "multi" && !colors.some((c) => c.family === f)));
        colors.push({ family: extra, ...COLOR_META[extra] });
      }

      const primary = primaryPool[i % primaryPool.length];
      const others = rotate(assets.filter((a) => a.id !== primary.id), i);
      const galleryCount = Math.min(others.length, rng.int(1, 3));
      const gallery = [primary, ...others.slice(0, galleryCount)];
      const images: ProductImage[] = gallery.map((a, idx) => ({
        assetId: a.id,
        alt: idx === 0 ? `${name} ${look.garment} in ${primaryColor.name}` : `${name} ${look.garment} — ${a.shot} view`,
      }));

      const videoAsset = look.video && i % 3 === 0 ? gallery.find((a) => videoSet.has(a.id)) : undefined;

      const [lo, hi] = look.price;
      const price = roundPrice(lo + rng.next() * (hi - lo));
      const onSale = rng.chance(0.25);
      const compareAtPrice = onSale ? roundPrice(price * (1.15 + rng.next() * 0.2)) : undefined;
      const daysAgo = rng.int(0, 150);
      const isNew = daysAgo < 45;
      const sizes = edition === "Unstitched" ? ["Unstitched"] : rng.chance(0.2) ? ["S", "M", "L", "Custom"] : ["XS", "S", "M", "L", "XL", "Custom"];
      const category = look.categories[i % look.categories.length];
      const fullName = edition ? `${name} ${look.garment} ${edition}` : `${name} ${look.garment}`;
      const slug = slugify(fullName);
      const sku = `SB-${String(serial).padStart(4, "0")}`;

      products.push({
        id: `p_${serial}`,
        slug,
        sku,
        name: fullName,
        category,
        price,
        compareAtPrice,
        currency: "PKR",
        description: buildDescription(look, primaryColor.name, edition),
        details: { fabric: look.fabric, work: look.work, pieces: look.pieces, care: CARE },
        colors,
        sizes,
        images,
        video: videoAsset ? { src: `/products/${videoAsset.id}/preview.mp4`, posterAssetId: videoAsset.id } : undefined,
        isNew,
        // Round-robin across looks so neighbouring cards in the default sort show different garments.
        featuredRank: i * LOOKS.length + ((lookIndex + i) % LOOKS.length),
        stock: rng.chance(0.06) ? 0 : rng.int(1, 12),
        createdAt: new Date(BASE_DATE - daysAgo * 86400000).toISOString(),
        occasion: look.occasion,
        tags: [
          look.garment,
          look.fabric,
          look.work,
          ...look.occasion,
          ...colors.map((c) => c.name),
          ...colors.map((c) => c.family),
          edition,
          category.replace("-", " "),
        ]
          .filter(Boolean)
          .map((t) => t.toLowerCase()),
      });
      serial++;
    }
  });

  return products;
}

export const PRODUCTS: Product[] = generate();
export const PRODUCT_BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));
export const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
export const PRICE_BOUNDS = PRODUCTS.reduce(
  (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
  { min: Infinity, max: 0 }
);
