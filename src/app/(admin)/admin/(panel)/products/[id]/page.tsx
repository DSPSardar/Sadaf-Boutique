import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import type { ProductMediaRow, ProductRow } from "@/lib/supabase/types";
import { MediaManager } from "@/components/admin/MediaManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "@/components/admin/ProductRowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await getServerSupabase();
  const [{ data: product }, { data: categories }, { data: media }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, label").order("sort_order"),
    supabase.from("product_media").select("*").eq("product_id", id).order("sort_order"),
  ]);
  if (!product) notFound();
  const row = product as ProductRow;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-muted">
            <Link href="/admin/products" className="hover:underline">Products</Link> / {row.sku}
          </p>
          <h1 className="mt-1 flex items-center gap-3 font-display text-3xl">
            {row.name} <StatusBadge status={row.status} />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {row.status === "active" ? (
            <Link href={`/product/${row.slug}`} target="_blank" className="text-[12px] underline underline-offset-4">
              View on storefront
            </Link>
          ) : null}
          <DeleteProductButton id={row.id} name={row.name} />
        </div>
      </div>
      {created ? <p className="rounded-xs border border-hairline bg-surface px-3 py-2 text-sm">Product created. Add photos below, then set it live.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ProductForm productId={row.id} categories={categories ?? []} defaults={row} />
        <MediaManager productId={row.id} initial={(media ?? []) as ProductMediaRow[]} />
      </div>
    </div>
  );
}
