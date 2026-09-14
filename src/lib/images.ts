import { GENERATED_ASSETS } from "@/data/assets.generated";

export const CARD_WIDTHS = [400, 600, 800] as const;

export function cardSrc(assetId: string, width: (typeof CARD_WIDTHS)[number] = 600): string {
  return `/products/${assetId}/card-${width}.webp`;
}

export function cardSrcSet(assetId: string): string {
  return CARD_WIDTHS.map((w) => `${cardSrc(assetId, w)} ${w}w`).join(", ");
}

export function largeSrc(assetId: string): string {
  return `/products/${assetId}/large.webp`;
}

export function blurDataURL(assetId: string): string | undefined {
  return GENERATED_ASSETS[assetId]?.blurDataURL;
}

export function largeDimensions(assetId: string): { width: number; height: number } {
  return GENERATED_ASSETS[assetId]?.large ?? { width: 960, height: 1280 };
}

/** `sizes` attribute matching the responsive product grid (2 → 6 columns). */
export const GRID_SIZES =
  "(min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";
