import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductGridProps {
  products: Product[];
  /** Number of leading cards to load eagerly (roughly one row). */
  eager?: number;
  sizes?: string;
}

/** 2 → 6 column responsive grid with tight, consistent gutters. */
export function ProductGrid({ products, eager = 6, sizes }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-3 sm:gap-x-3 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-7 xl:grid-cols-5 2xl:grid-cols-6" role="list">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < eager} sizes={sizes} />
        </li>
      ))}
    </ul>
  );
}
