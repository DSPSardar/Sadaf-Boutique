"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useWishlist } from "@/store/wishlist";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  variant?: "overlay" | "inline";
  className?: string;
}

export function WishlistButton({ productId, productName, variant = "overlay", className }: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const saved = has(productId);
  const label = saved ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`;

  if (variant === "inline") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        aria-label={label}
        onClick={() => toggle(productId)}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-xs border border-hairline px-4 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:border-ink",
          className
        )}
      >
        <Heart size={16} strokeWidth={1.5} className={cn("transition-colors", saved && "fill-oxblood text-oxblood")} />
        {saved ? "Saved" : "Wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-surface/85 text-ink backdrop-blur-sm transition-all duration-200 hover:bg-surface",
        className
      )}
    >
      <Heart size={15} strokeWidth={1.6} className={cn("transition-colors duration-200", saved && "fill-oxblood text-oxblood")} />
    </button>
  );
}
