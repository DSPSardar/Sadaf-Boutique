import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatPKR } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { ProductStatus } from "@/lib/supabase/types";

export default async function AdminDashboard() {
  const supabase = await getServerSupabase();
  const count = async (status?: ProductStatus) => {
    let q = supabase.from("products").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    return (await q).count ?? 0;
  };
  const [total, active, draft, archived] = await Promise.all([count(), count("active"), count("draft"), count("archived")]);
  const { data: lowStock } = await supabase.from("products").select("id, name, sku, stock, status").lte("stock", 2).neq("status", "archived").order("stock").limit(8);
  const { data: recent } = await supabase.from("products").select("id, name, sku, price, status, updated_at").order("updated_at", { ascending: false }).limit(8);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="text-sm text-muted">What is live, what needs attention.</p>
        </div>
        <Link href="/admin/products/new">
          <Button>New product</Button>
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["All products", total],
          ["Live", active],
          ["Drafts", draft],
          ["Archived", archived],
        ].map(([label, n]) => (
          <div key={label} className="rounded-xs border border-hairline bg-surface p-4">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xs border border-hairline bg-surface">
          <h2 className="border-b border-hairline px-4 py-3 text-[12px] font-medium uppercase tracking-[0.14em]">Low stock</h2>
          {lowStock?.length ? (
            <ul className="divide-y divide-hairline">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="min-w-0 truncate hover:underline">
                    {p.name} <span className="text-muted">· {p.sku}</span>
                  </Link>
                  <span className={p.stock === 0 ? "text-oxblood" : "text-muted"}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-muted">Every product has more than two in stock.</p>
          )}
        </section>
        <section className="rounded-xs border border-hairline bg-surface">
          <h2 className="border-b border-hairline px-4 py-3 text-[12px] font-medium uppercase tracking-[0.14em]">Recently edited</h2>
          <ul className="divide-y divide-hairline">
            {recent?.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <Link href={`/admin/products/${p.id}`} className="min-w-0 truncate hover:underline">
                  {p.name}
                </Link>
                <span className="flex shrink-0 items-center gap-2 text-muted">
                  {formatPKR(p.price)} <StatusBadge status={p.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
