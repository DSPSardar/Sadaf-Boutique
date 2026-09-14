"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryLabel } from "@/data/categories";
import { useUI } from "@/store/ui";
import { Modal } from "@/components/ui/Modal";
import { Price } from "@/components/product/Price";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";

/** Quick-view modal mounted once in the root layout; driven by `useUI().quickViewProduct`. */
export function ProductQuickView() {
  const { quickViewProduct: product, closeQuickView } = useUI();
  if (!product) return null;

  return (
    <Modal open onClose={closeQuickView} label={`Quick view: ${product.name}`}>
      <div className="grid overflow-y-auto sm:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] sm:overflow-hidden">
        <div className="p-3 sm:p-5 sm:pr-0">
          <ProductGallery product={product} compact />
        </div>
        <div className="flex flex-col gap-4 p-4 pb-6 sm:overflow-y-auto sm:p-6">
          <div>
            <p className="eyebrow">{categoryLabel(product.category)}</p>
            <h2 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{product.name}</h2>
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="md" className="mt-2" />
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{product.description}</p>
          <PurchasePanel product={product} compact onAdded={closeQuickView} />
          <Link href={`/product/${product.slug}`} onClick={closeQuickView} className="inline-flex items-center gap-1 self-start text-[12px] font-medium uppercase tracking-[0.14em] underline-offset-4 hover:underline">
            View full details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
