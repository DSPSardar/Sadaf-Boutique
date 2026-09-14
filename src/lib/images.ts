import { GENERATED_ASSETS } from "@/data/assets.generated";
import { mediaBase } from "@/lib/media";
import type { ProductImage } from "@/types/product";

export const CARD_WIDTHS = [400, 600, 800] as const;

export function cardSrc(assetId: string, width: (typeof CARD_WIDTHS)[number] = 600): string {
  return `${mediaBase(assetId)}/card-${width}.webp`;
}

export function cardSrcSet(assetId: string): string {
  return CARD_WIDTHS.map((w) => `${cardSrc(assetId, w)} ${w}w`).join(", ");
}

export function largeSrc(assetId: string): string {
  return `${mediaBase(assetId)}/large.webp`;
}

/** Blur placeholder: from the image record when it came from the database, else from the generated mock assets. */
export function blurDataURL(image: Pick<ProductImage, "assetId" | "blurDataURL"> | string): string | undefined {
  if (typeof image === "string") return GENERATED_ASSETS[image]?.blurDataURL;
  return image.blurDataURL ?? GENERATED_ASSETS[image.assetId]?.blurDataURL;
}

export function largeDimensions(image: Pick<ProductImage, "assetId" | "width" | "height"> | string): { width: number; height: number } {
  if (typeof image !== "string" && image.width && image.height) return { width: image.width, height: image.height };
  const id = typeof image === "string" ? image : image.assetId;
  return GENERATED_ASSETS[id]?.large ?? { width: 960, height: 1280 };
}

/** `sizes` attribute matching the responsive product grid (2 → 6 columns). */
export const GRID_SIZES =
  "(min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";
