import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/data/categories";
import { catalog } from "@/lib/catalog-source";
import { BRAND, categoryJsonLd, jsonLdString } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
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
  if (!category) return {};
  return {
    title: `${category.label} – Pakistani ${category.label} Dresses`,
    description: `${category.description} Shop ${category.label.toLowerCase()} by ${BRAND}, Lahore – order on WhatsApp, delivery across Pakistan and worldwide.`,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) notFound();
  const products = await catalog.getProducts();
  const inCategory = products.filter((p) => p.category === category.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(categoryJsonLd(category.slug, category.label, category.description, inCategory)) }} />
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
