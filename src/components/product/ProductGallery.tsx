"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { blurDataURL, cardSrc, largeDimensions, largeSrc } from "@/lib/images";
import type { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
  /** Smaller thumbnails and no side rail (quick view). */
  compact?: boolean;
}

type Slide = { kind: "image"; assetId: string; alt: string } | { kind: "video"; src: string; posterAssetId: string };

/** Main 4:5 canvas showing the full garment (no crop) with a thumbnail rail and prev/next controls. */
export function ProductGallery({ product, compact }: ProductGalleryProps) {
  const slides: Slide[] = [
    ...product.images.map((img) => ({ kind: "image" as const, assetId: img.assetId, alt: img.alt })),
    ...(product.video ? [{ kind: "video" as const, src: product.video.src, posterAssetId: product.video.posterAssetId }] : []),
  ];
  const [index, setIndex] = useState(0);
  const [prevProductId, setPrevProductId] = useState(product.id);
  if (prevProductId !== product.id) {
    setPrevProductId(product.id);
    setIndex(0);
  }
  const active = slides[index];
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div className={cn("flex flex-col gap-3", !compact && "lg:flex-row-reverse lg:gap-4")}>
      <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-xs bg-sand", compact && "max-h-[58vh]")} onKeyDown={(e) => (e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" ? go(-1) : null)}>
        {active.kind === "image" ? (
          <ImageSlide key={active.assetId} assetId={active.assetId} alt={active.alt} priority={index === 0} />
        ) : (
          <video
            key={active.src}
            src={active.src}
            poster={cardSrc(active.posterAssetId, 800)}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {slides.length > 1 ? (
          <>
            <button type="button" aria-label="Previous image" onClick={() => go(-1)} className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm transition-colors hover:bg-surface">
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Next image" onClick={() => go(1)} className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm transition-colors hover:bg-surface">
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-ink/60 px-2 py-0.5 text-[11px] tabular-nums text-ivory">
              {index + 1} / {slides.length}
            </span>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <ul className={cn("no-scrollbar flex gap-2 overflow-x-auto", !compact && "lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto")} role="tablist" aria-label="Product media">
          {slides.map((s, i) => {
            const assetId = s.kind === "image" ? s.assetId : s.posterAssetId;
            return (
              <li key={i} className="shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={s.kind === "video" ? "Play video" : `View image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative block aspect-[4/5] overflow-hidden rounded-xs border-2 transition-colors",
                    compact ? "w-14" : "w-16 lg:w-full",
                    i === index ? "border-ink" : "border-transparent hover:border-hairline"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cardSrc(assetId, 400)} alt="" width={80} height={100} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  {s.kind === "video" ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/30 text-ivory">
                      <Play size={16} className="fill-current" />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ImageSlide({ assetId, alt, priority }: { assetId: string; alt: string; priority: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const dims = largeDimensions(assetId);
  const markLoadedIfComplete = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <div className="absolute inset-0" style={{ backgroundImage: `url(${blurDataURL(assetId)})`, backgroundSize: "cover" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={markLoadedIfComplete}
        src={largeSrc(assetId)}
        alt={alt}
        width={dims.width}
        height={dims.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn("h-full w-full object-contain transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
