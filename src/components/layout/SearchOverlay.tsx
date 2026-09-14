"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { PRODUCTS } from "@/data/products";
import { searchProducts } from "@/lib/catalog";
import { useDialog } from "@/hooks/useDialog";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useUI } from "@/store/ui";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";

const SUGGESTIONS = ["Velvet", "Bridal lehenga", "Gharara", "Royal blue", "Tissue", "Mehndi"];

/** Full-screen instant search over the mock catalogue. */
export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  if (!searchOpen) return null;
  return <SearchPanel onClose={closeSearch} />;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const searchOpen = true;
  const closeSearch = onClose;
  const [term, setTerm] = useState("");
  const deferred = useDeferredValue(term);
  const [recent, setRecent] = useLocalStorageState<string[]>("sadaf.recent-searches", []);
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(searchOpen, closeSearch, panelRef);

  const results = useMemo(() => searchProducts(PRODUCTS, deferred, 24), [deferred]);
  const hasTerm = deferred.trim().length > 0;

  const remember = (t: string) => {
    const clean = t.trim();
    if (!clean) return;
    setRecent((prev) => [clean, ...prev.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 6));
  };

  return (
    <div className="fixed inset-0 z-50 bg-ivory animate-fade-in" role="dialog" aria-modal="true" aria-label="Search" ref={panelRef}>
      <div className="container-wide flex h-14 items-center gap-2 border-b border-hairline lg:h-16">
        <Search size={20} strokeWidth={1.5} className="shrink-0 text-muted" />
        <input
          data-autofocus
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && remember(term)}
          placeholder="Search bridal, velvet, lehenga, royal blue…"
          aria-label="Search products"
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/70 sm:text-lg"
        />
        {term ? (
          <IconButton label="Clear search" onClick={() => setTerm("")}>
            <X size={18} strokeWidth={1.5} />
          </IconButton>
        ) : null}
        <button type="button" onClick={closeSearch} className="ml-1 text-[12px] font-medium uppercase tracking-[0.16em] hover:text-gold">
          Close
        </button>
      </div>

      <div className="container-wide h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain py-5 lg:h-[calc(100dvh-4rem)]" onClick={(e) => (e.target as HTMLElement).closest("a") && (remember(term), closeSearch())}>
        {!hasTerm ? (
          <div className="grid gap-8 sm:grid-cols-2">
            {recent.length ? (
              <section>
                <p className="eyebrow mb-3">Recent</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <Chip key={r} onClick={() => setTerm(r)}>{r}</Chip>
                  ))}
                </div>
              </section>
            ) : null}
            <section>
              <p className="eyebrow mb-3">Popular</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <Chip key={s} onClick={() => setTerm(s)}>{s}</Chip>
                ))}
              </div>
            </section>
            <section className="sm:col-span-2">
              <p className="eyebrow mb-3">Browse</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border border-hairline px-3 py-1.5 text-[13px] transition-colors hover:border-ink">
                    {c.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        ) : results.length ? (
          <>
            <p className="mb-4 text-sm text-muted" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"} for “{deferred}”
            </p>
            <ProductGrid products={results} eager={12} />
          </>
        ) : (
          <EmptyState
            icon={<Search size={28} strokeWidth={1.2} />}
            title={`No results for “${deferred}”`}
            description="Try a colour, fabric or garment — for example “red velvet”, “gharara” or “tissue”."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.slice(0, 4).map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border border-hairline px-3 py-1.5 text-[13px] transition-colors hover:border-ink">
                    {c.label}
                  </Link>
                ))}
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[13px] transition-colors hover:border-ink">
      {children}
    </button>
  );
}
