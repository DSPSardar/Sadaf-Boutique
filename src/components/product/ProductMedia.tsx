"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { blurDataURL, cardSrc, cardSrcSet, GRID_SIZES } from "@/lib/images";
import { useCanHover } from "@/hooks/useMediaQuery";
import type { Product } from "@/types/product";

interface ProductMediaProps {
  product: Product;
  /** Eager-load above-the-fold cards. */
  priority?: boolean;
  /** Parent reports hover state so the card can drive crossfade / video preview. */
  hovered: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Card imagery: responsive WebP with blur placeholder and fade-in; on hover-capable devices
 * it crossfades to the second photo, or plays the muted preview clip when one exists.
 * Videos are only mounted while hovered so nothing is downloaded up front.
 */
export function ProductMedia({ product, priority, hovered, sizes = GRID_SIZES, className }: ProductMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const canHover = useCanHover();
  // Cached images can finish loading before hydration, in which case onLoad never fires.
  const markLoadedIfComplete = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const primary = product.images[0];
  const secondary = product.images[1];
  const showVideo = canHover && hovered && !!product.video;
  const showSecondary = canHover && hovered && !product.video && !!secondary;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (showVideo) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [showVideo]);

  return (
    <div
      className={cn("relative aspect-[4/5] w-full overflow-hidden bg-sand", className)}
      style={{ backgroundImage: `url(${blurDataURL(primary.assetId)})`, backgroundSize: "cover" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={markLoadedIfComplete}
        src={cardSrc(primary.assetId, 600)}
        srcSet={cardSrcSet(primary.assetId)}
        sizes={sizes}
        alt={primary.alt}
        width={600}
        height={750}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)]",
          loaded ? "opacity-100" : "opacity-0",
          hovered && canHover && "scale-[1.04]",
          showSecondary || showVideo ? "opacity-0" : ""
        )}
      />
      {secondary && canHover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cardSrc(secondary.assetId, 600)}
          srcSet={cardSrcSet(secondary.assetId)}
          sizes={sizes}
          alt=""
          aria-hidden="true"
          width={600}
          height={750}
          loading="lazy"
          decoding="async"
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", showSecondary ? "opacity-100" : "opacity-0")}
        />
      ) : null}
      {product.video && canHover && hovered ? (
        <video
          ref={videoRef}
          src={product.video.src}
          poster={cardSrc(product.video.posterAssetId, 600)}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover animate-fade-in"
        />
      ) : null}
    </div>
  );
}
