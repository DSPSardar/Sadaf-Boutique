import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = await getServerSupabase();
  const { data: categories } = await supabase.from("categories").select("id, label").order("sort_order");
  const { data: last } = await supabase.from("products").select("sku").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const nextSku = `SB-${String((Number(last?.sku?.replace(/\D/g, "")) || 0) + 1).padStart(4, "0")}`;

  return (
    <div className="space-y-5">
      <p className="text-[12px] text-muted">
        <Link href="/admin/products" className="hover:underline">Products</Link> / New
      </p>
      <h1 className="font-display text-3xl">New product</h1>
      <p className="max-w-xl text-sm text-muted">Save the product first, then add photos and a video. It stays a draft until you set it live.</p>
      <ProductForm categories={categories ?? []} defaults={{ sku: nextSku }} />
    </div>
  );
}
