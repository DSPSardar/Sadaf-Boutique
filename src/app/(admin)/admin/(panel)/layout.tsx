import Link from "next/link";
import type { Metadata } from "next";
import { LayoutDashboard, LogOut, Shapes, Shirt, Store } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { hasSupabase } from "@/lib/supabase/env";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Shirt },
  { href: "/admin/categories", label: "Categories", icon: Shapes },
];

/** Admin shell: every page below is server-rendered for a verified admin only. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabase()) return <NotConfigured />;
  const session = await requireAdmin();
  return (
    <div className="flex min-h-dvh bg-ivory">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface lg:flex">
        <div className="border-b border-hairline px-5 py-5">
          <p className="font-display text-lg uppercase tracking-[0.18em]">Sadaf Boutique</p>
          <p className="eyebrow mt-1">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm transition-colors hover:bg-sand">
              <n.icon size={16} strokeWidth={1.5} />
              {n.label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="mt-2 flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm text-muted transition-colors hover:bg-sand">
            <Store size={16} strokeWidth={1.5} />
            View storefront
          </Link>
        </nav>
        <form action={signOut} className="border-t border-hairline p-3">
          <p className="truncate px-3 pb-2 text-[11px] text-muted">{session.email}</p>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xs px-3 py-2 text-sm transition-colors hover:bg-sand">
            <LogOut size={16} strokeWidth={1.5} /> Sign out
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-hairline bg-surface px-4 lg:hidden">
          <span className="font-display uppercase tracking-[0.18em]">Admin</span>
          <nav className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.12em]">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-xs px-2 py-1 hover:bg-sand">
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
