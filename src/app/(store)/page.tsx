import { Suspense } from "react";
import { catalog } from "@/lib/catalog-source";
import { Hero } from "@/components/home/Hero";
import { CategoryNav } from "@/components/home/CategoryNav";
import { ShopResults } from "@/components/shop/ShopResults";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default async function HomePage() {
  const products = await catalog.getProducts();
  return (
    <>
      <Hero />
      <Suspense>
        <CategoryNav />
      </Suspense>
      <div className="container-wide mt-5 sm:mt-6">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopResults products={products} title="New Collection" />
        </Suspense>
      </div>
    </>
  );
}
