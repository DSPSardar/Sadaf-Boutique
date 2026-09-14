import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categoryLabel } from "@/data/categories";
import { PRODUCTS } from "@/data/products";
import { catalog, getRelated } from "@/lib/catalog";
import { cardSrc } from "@/lib/images";
import { Price } from "@/components/product/Price";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Tag } from "@/components/ui/Tag";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [cardSrc(product.images[0].assetId, 800)] },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();
  const related = getRelated(product, await catalog.getProducts(), 12);
  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="container-wide pt-3 pb-24 lg:pt-5 lg:pb-0">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-[11px] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight size={12} />
        <Link href={`/category/${product.category}`} className="hover:text-ink">{categoryLabel(product.category)}</Link>
        <ChevronRight size={12} />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="eyebrow">{categoryLabel(product.category)}</p>
              {product.stock === 0 ? <Tag tone="muted">Sold out</Tag> : onSale ? <Tag tone="sale">Sale</Tag> : product.isNew ? <Tag>New</Tag> : null}
            </div>
            <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">{product.name}</h1>
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" className="mt-3" />
            <p className="mt-1 text-[11px] text-muted">SKU {product.sku} · Prices include tax</p>
          </div>

          <p className="text-sm leading-relaxed text-muted">{product.description}</p>

          <PurchasePanel product={product} stickyBar />

          <div className="divide-y divide-hairline border-y border-hairline">
            <details className="group py-3" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-medium uppercase tracking-[0.14em]">
                Details
                <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
              </summary>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted">Fabric</dt>
                <dd>{product.details.fabric}</dd>
                <dt className="text-muted">Work</dt>
                <dd>{product.details.work}</dd>
                <dt className="text-muted">Includes</dt>
                <dd>{product.details.pieces.join(", ")}</dd>
                <dt className="text-muted">Occasion</dt>
                <dd>{product.occasion.join(", ")}</dd>
                <dt className="text-muted">Care</dt>
                <dd>{product.details.care}</dd>
              </dl>
            </details>
            <details className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-medium uppercase tracking-[0.14em]">
                Shipping & returns
                <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-3 space-y-2 text-sm text-muted">
                <p>Ready-to-wear pieces dispatch within 3–5 working days; made-to-measure and unstitched orders ship in 2–3 weeks. Free delivery across Pakistan, worldwide shipping quoted on WhatsApp.</p>
                <p>Exchanges accepted within 7 days for unworn, unaltered pieces with tags attached. Bridal and custom-stitched orders are final sale.</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
