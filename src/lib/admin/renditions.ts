import "server-only";
import sharp, { type Sharp } from "sharp";
import { RENDITIONS } from "@/lib/media";

export interface Rendition {
  name: string;
  body: Buffer;
  contentType: string;
}

export interface RenditionSet {
  files: Rendition[];
  width: number;
  height: number;
  blurDataURL: string;
}

/**
 * Same pipeline as scripts/optimize-images.mjs, applied to an uploaded photo:
 * 4:5 cards at 400/600/800 (cover-crop when near 4:5, blurred fill for very tall photos),
 * a fit-inside large image, and a tiny blur placeholder.
 */
export async function buildRenditions(input: Buffer): Promise<RenditionSet> {
  const base = sharp(input).rotate();
  const meta = await base.metadata();
  const source = await base.toBuffer();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const ratio = width / Math.max(height, 1);
  const files: Rendition[] = [];

  for (const w of RENDITIONS.card) {
    const h = Math.round(w / RENDITIONS.cardRatio);
    let img: Sharp;
    if (ratio >= 0.7) {
      img = sharp(source).resize(w, h, { fit: "cover", position: "attention" });
    } else {
      const fg = await sharp(source).resize({ height: h, fit: "inside" }).toBuffer();
      const bg = await sharp(source).resize(w, h, { fit: "cover" }).blur(30).modulate({ brightness: 0.82, saturation: 0.9 }).toBuffer();
      img = sharp(bg).composite([{ input: fg, gravity: "centre" }]);
    }
    files.push({ name: `card-${w}.webp`, body: await img.webp({ quality: 78, effort: 5 }).toBuffer(), contentType: "image/webp" });
  }

  const large = await sharp(source)
    .resize(RENDITIONS.large.width, RENDITIONS.large.height, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  files.push({ name: "large.webp", body: large.data, contentType: "image/webp" });

  const blur = await sharp(source).resize(16, 20, { fit: "cover" }).webp({ quality: 40 }).toBuffer();

  return { files, width: large.info.width, height: large.info.height, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` };
}
