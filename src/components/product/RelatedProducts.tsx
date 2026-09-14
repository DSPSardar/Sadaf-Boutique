import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";

export function RelatedProducts({ products, title = "You may also like" }: { products: Product[]; title?: string }) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-14">
      <h2 id="related-heading" className="mb-5 font-display text-2xl sm:text-3xl">
        {title}
      </h2>
      <ProductGrid products={products} eager={0} />
    </section>
  );
}
