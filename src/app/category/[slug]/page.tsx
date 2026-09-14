import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/data/categories";
import { catalog } from "@/lib/catalog";
import { CategoryNav } from "@/components/home/CategoryNav";
import { ShopResults } from "@/components/shop/ShopResults";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  return category ? { title: category.label, description: category.description } : {};
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) notFound();
  const products = await catalog.getProducts();

  return (
    <>
      <div className="container-wide pt-5">
        <p className="eyebrow">Category</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">{category.label}</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">{category.description}</p>
      </div>
      <Suspense>
        <CategoryNav />
      </Suspense>
      <div className="container-wide mt-5 sm:mt-6">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopResults products={products} lockedCategory={category.slug} />
        </Suspense>
      </div>
    </>
  );
}
