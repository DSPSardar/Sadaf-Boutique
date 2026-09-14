import { getServerSupabase } from "@/lib/supabase/server";
import type { CategoryRow } from "@/lib/supabase/types";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function AdminCategories() {
  const supabase = await getServerSupabase();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  const { data: counts } = await supabase.from("products").select("category_id");
  const countBy = new Map<string, number>();
  counts?.forEach((p) => countBy.set(p.category_id, (countBy.get(p.category_id) ?? 0) + 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Categories</h1>
        <p className="text-sm text-muted">The category rail and filters on the storefront follow this list and its order.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {(categories as CategoryRow[] | null)?.map((c) => (
          <CategoryForm key={c.id} category={c} productCount={countBy.get(c.id) ?? 0} />
        ))}
        <CategoryForm />
      </div>
    </div>
  );
}
