"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useCatalog } from "@/store/catalog";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export function WishlistView() {
  const { ids, hydrated, clear } = useWishlist();
  const { byId } = useCatalog();
  const products = ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);

  if (!hydrated) {
    return (
      <div className="mt-6">
        <ProductGridSkeleton count={6} />
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={28} strokeWidth={1.2} />}
        title="Your wishlist is empty"
        description="Tap the heart on any piece to save it here for later."
        action={
          <Link href="/shop">
            <Button>Browse the collection</Button>
          </Link>
        }
      />
    );
  }
  return (
    <div className="mt-2">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          {products.length} saved {products.length === 1 ? "piece" : "pieces"}
        </p>
        <button type="button" onClick={clear} className="text-[12px] underline underline-offset-4 hover:text-gold">
          Clear all
        </button>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
