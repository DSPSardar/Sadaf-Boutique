import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatPKR } from "@/lib/format";
import { mediaBase } from "@/lib/media";
import type { ProductStatus } from "@/lib/supabase/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { Button } from "@/components/ui/Button";

const PAGE = 25;
type Search = { q?: string; status?: string; category?: string; page?: string; deleted?: string };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const supabase = await getServerSupabase();
  const { data: categories } = await supabase.from("categories").select("id, slug, label").order("sort_order");

  let query = supabase
    .from("products")
    .select("id, name, sku, price, compare_at_price, stock, status, updated_at, categories(label), product_media(storage_path, kind, sort_order)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (sp.q) query = query.ilike("search_text", `%${sp.q.toLowerCase()}%`);
  if (sp.status) query = query.eq("status", sp.status as ProductStatus);
  if (sp.category) query = query.eq("category_id", sp.category);
  const { data: products, count, error } = await query;
  if (error) throw new Error(error.message);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));

  const thumb = (media: { storage_path: string; kind: string; sort_order: number }[]) => {
    const img = media.filter((m) => m.kind === "image").sort((a, b) => a.sort_order - b.sort_order)[0];
    return img && img.storage_path !== "pending" ? `${mediaBase(img.storage_path)}/card-400.webp` : null;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted">{count ?? 0} products</p>
        </div>
        <Link href="/admin/products/new">
          <Button>New product</Button>
        </Link>
      </div>
      {sp.deleted ? <p className="rounded-xs border border-hairline bg-surface px-3 py-2 text-sm">Product deleted.</p> : null}

      <form className="flex flex-wrap items-center gap-2 rounded-xs border border-hairline bg-surface p-2">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search name, SKU or tag" aria-label="Search products" className="h-9 min-w-56 flex-1 rounded-xs border border-hairline px-3 text-sm outline-none focus:border-ink" />
        <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className="h-9 rounded-xs border border-hairline bg-surface px-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Live</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className="h-9 rounded-xs border border-hairline bg-surface px-2 text-sm">
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="secondary" type="submit">
          Filter
        </Button>
        {sp.q || sp.status || sp.category ? (
          <Link href="/admin/products" className="text-[12px] underline underline-offset-4">
            Clear
          </Link>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-xs border border-hairline bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-sand/60 text-left text-[11px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {products?.length ? (
              products.map((p) => {
                const category = (p.categories as unknown as { label: string } | null)?.label ?? "—";
                const src = thumb((p.product_media as unknown as { storage_path: string; kind: string; sort_order: number }[]) ?? []);
                return (
                  <tr key={p.id} className="hover:bg-sand/40">
                    <td className="px-3 py-2">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <span className="block h-12 w-10 shrink-0 overflow-hidden rounded-xs bg-sand">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {src ? <img src={src} alt="" width={40} height={50} className="h-full w-full object-cover" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="block text-[12px] text-muted">{p.sku}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted">{category}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatPKR(p.price)}
                      {p.compare_at_price ? <span className="ml-1 text-[12px] text-muted line-through">{formatPKR(p.compare_at_price)}</span> : null}
                    </td>
                    <td className={`px-3 py-2 tabular-nums ${p.stock === 0 ? "text-oxblood" : ""}`}>{p.stock}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <ProductRowActions id={p.id} status={p.status} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-muted">
                  No products match. <Link href="/admin/products/new" className="underline">Create one</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? <Link className="underline underline-offset-4" href={{ pathname: "/admin/products", query: { ...sp, page: page - 1 } }}>Previous</Link> : null}
            {page < pages ? <Link className="underline underline-offset-4" href={{ pathname: "/admin/products", query: { ...sp, page: page + 1 } }}>Next</Link> : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
