import { MEDIA_BUCKET, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Media keys are opaque strings stored on products:
 *  - mock/local keys have no slash ("5451df09") and resolve to /products/<key>/…
 *  - storage keys look like "products/<mediaId>" and resolve to the Supabase public bucket.
 * Every rendition (card-400/600/800.webp, large.webp, video.mp4) lives under that base.
 */
export function isStorageKey(key: string): boolean {
  return key.includes("/");
}

export function storagePublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

export function mediaBase(key: string): string {
  return isStorageKey(key) ? storagePublicUrl(key) : `/products/${key}`;
}

export const RENDITIONS = {
  card: [400, 600, 800] as const,
  cardRatio: 4 / 5,
  large: { width: 1024, height: 1280 },
  video: "video.mp4",
} as const;
