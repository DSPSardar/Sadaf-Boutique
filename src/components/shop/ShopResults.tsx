"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { filterProducts, sortProducts } from "@/lib/catalog";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { FilterDrawer } from "@/components/shop/FilterDrawer";
import { SortDropdown } from "@/components/shop/SortDropdown";
import { useShopQuery } from "@/components/shop/useShopQuery";

const PAGE = 36;

interface ShopResultsProps {
  products: Product[];
  lockedCategory?: string;
  title?: string;
}

/**
 * Filterable, sortable, incrementally loaded product feed. Filtering runs instantly on the
 * client against the catalogue passed in; swap the `products` prop for a server query later.
 */
export function ShopResults({ products, lockedCategory, title }: ShopResultsProps) {
  const { query, update, replace, clear, activeCount } = useShopQuery(lockedCategory);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => sortProducts(filterProducts(products, query), query.sort), [products, query]);
  const shown = results.slice(0, visible);
  const hasMore = visible < results.length;

  // Reset pagination whenever the result set changes.
  const [prevResults, setPrevResults] = useState(results);
  if (prevResults !== results) {
    setPrevResults(results);
    setVisible(PAGE);
  }

  // Load the next batch as the sentinel scrolls into view (with a short skeleton state).
  // One observer per result set; a ref guards against double loads without re-subscribing.
  const loadingRef = useRef(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || loadingRef.current) return;
        loadingRef.current = true;
        setLoadingMore(true);
        window.setTimeout(() => {
          setVisible((v) => v + PAGE);
          setLoadingMore(false);
          loadingRef.current = false;
        }, 250);
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, results]);

  return (
    <section aria-label={title ?? "Products"}>
      {title ? <h2 className="mb-1 font-display text-2xl leading-none sm:text-3xl">{title}</h2> : null}
      <div className="sticky top-14 z-30 -mx-3 mb-3 bg-ivory/95 px-3 py-2 backdrop-blur-sm sm:-mx-5 sm:px-5 lg:top-16 lg:-mx-6 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 shrink-0 text-[12px] text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <SortDropdown value={query.sort ?? "featured"} onChange={(sort) => update({ sort })} />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-xs border border-hairline bg-surface px-3 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors hover:border-ink"
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              Filters
              {activeCount ? <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-ivory">{activeCount}</span> : null}
            </button>
          </div>
        </div>
        <div className="mt-2 empty:hidden">
          <ActiveFilters query={query} lockedCategory={lockedCategory} onUpdate={update} onClear={clear} />
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX size={28} strokeWidth={1.2} />}
          title="Nothing matches those filters"
          description="Try removing a filter or widening the price range — new pieces are added every week."
          action={
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <ProductGrid products={shown} />
          {loadingMore ? (
            <div className="mt-5 grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-3 sm:gap-x-3 lg:grid-cols-4 lg:gap-x-4 xl:grid-cols-5 2xl:grid-cols-6" aria-busy="true" aria-label="Loading more products">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : null}
          <div ref={sentinelRef} aria-hidden="true" className="h-px" />
          {hasMore && !loadingMore ? (
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-[12px] text-muted">
                Showing {shown.length} of {results.length}
              </p>
              <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE)}>
                Show more
              </Button>
            </div>
          ) : null}
        </>
      )}

      <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} products={products} query={query} lockedCategory={lockedCategory} onApply={replace} />
    </section>
  );
}
