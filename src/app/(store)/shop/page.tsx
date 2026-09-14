import type { Metadata } from "next";
import { Suspense } from "react";
import { catalog } from "@/lib/catalog-source";
import { CategoryNav } from "@/components/home/CategoryNav";
import { ShopResults } from "@/components/shop/ShopResults";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const products = await catalog.getProducts();
  return (
    <>
      <div className="container-wide pt-5">
        <h1 className="font-display text-3xl sm:text-4xl">Shop</h1>
        <p className="mt-1 text-sm text-muted">Every piece from the current collection.</p>
      </div>
      <Suspense>
        <CategoryNav />
      </Suspense>
      <div className="container-wide mt-5 sm:mt-6">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopResults products={products} />
        </Suspense>
      </div>
    </>
  );
}
