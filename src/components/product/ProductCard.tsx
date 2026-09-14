"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { Eye } from "lucide-react";
import { categoryLabel } from "@/data/categories";
import { cn } from "@/lib/cn";
import { useUI } from "@/store/ui";
import type { Product } from "@/types/product";
import { Price } from "@/components/product/Price";
import { ProductMedia } from "@/components/product/ProductMedia";
import { Tag } from "@/components/ui/Tag";
import { VideoBadge } from "@/components/product/VideoBadge";
import { WishlistButton } from "@/components/product/WishlistButton";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  sizes?: string;
}

/** Dense, image-first product card. Whole image links to the product page; quick view is a secondary action. */
export const ProductCard = memo(function ProductCard({ product, priority, sizes }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { openQuickView } = useUI();
  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const soldOut = product.stock === 0;
  const href = `/product/${product.slug}`;

  return (
    <article
      className={cn("group relative flex flex-col gap-2 transition-transform duration-300 ease-[var(--ease-out-soft)]", hovered && "lg:-translate-y-0.5")}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 420px" }}
    >
      <div className={cn("relative overflow-hidden rounded-xs transition-shadow duration-300", hovered && "shadow-lift")}>
        <Link href={href} aria-label={product.name} className="block">
          <ProductMedia product={product} priority={priority} hovered={hovered} sizes={sizes} />
        </Link>

        <div className="pointer-events-none absolute top-2 left-2 flex flex-col gap-1">
          {soldOut ? <Tag tone="muted">Sold out</Tag> : onSale ? <Tag tone="sale">Sale</Tag> : product.isNew ? <Tag>New</Tag> : null}
        </div>
        {product.video ? <VideoBadge className="pointer-events-none absolute bottom-2 left-2" /> : null}

        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute top-2 right-2 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100 data-[saved=true]:opacity-100"
        />

        <button
          type="button"
          onClick={() => openQuickView(product)}
          aria-label={`Quick view ${product.name}`}
          className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/85 text-ink backdrop-blur-sm transition-colors hover:bg-surface lg:hidden"
        >
          <Eye size={15} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          onClick={() => openQuickView(product)}
          className={cn(
            "absolute inset-x-2 bottom-2 hidden h-9 items-center justify-center rounded-xs bg-surface/90 text-[11px] font-medium uppercase tracking-[0.16em] text-ink backdrop-blur-sm transition-[opacity,transform] duration-300 ease-[var(--ease-out-soft)] hover:bg-surface lg:flex",
            hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}
        >
          Quick view
        </button>
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        <span className="eyebrow truncate">{categoryLabel(product.category)}</span>
        <h3 className="truncate text-[13px] leading-snug sm:text-sm">
          <Link href={href} className="after:absolute after:inset-x-0 after:-top-2 after:bottom-0 after:content-[''] after:pointer-events-none">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
      </div>
    </article>
  );
});
