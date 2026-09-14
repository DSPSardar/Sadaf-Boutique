"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { CatalogQuery, SortKey } from "@/types/product";

const SORTS: SortKey[] = ["featured", "newest", "price-asc", "price-desc"];

export function parseQuery(params: URLSearchParams, lockedCategory?: string): CatalogQuery {
  const num = (k: string) => {
    const v = Number(params.get(k));
    return params.has(k) && Number.isFinite(v) ? v : undefined;
  };
  const list = (k: string) => params.get(k)?.split(",").filter(Boolean) ?? [];
  const sort = params.get("sort") as SortKey | null;
  return {
    category: lockedCategory ?? params.get("category") ?? undefined,
    colors: list("color"),
    sizes: list("size"),
    minPrice: num("min"),
    maxPrice: num("max"),
    isNew: params.get("new") === "1",
    onSale: params.get("sale") === "1",
    q: params.get("q") ?? undefined,
    sort: sort && SORTS.includes(sort) ? sort : "featured",
  };
}

export function serializeQuery(q: CatalogQuery, lockedCategory?: string): string {
  const p = new URLSearchParams();
  if (q.category && !lockedCategory) p.set("category", q.category);
  if (q.colors?.length) p.set("color", q.colors.join(","));
  if (q.sizes?.length) p.set("size", q.sizes.join(","));
  if (q.minPrice !== undefined) p.set("min", String(q.minPrice));
  if (q.maxPrice !== undefined) p.set("max", String(q.maxPrice));
  if (q.isNew) p.set("new", "1");
  if (q.onSale) p.set("sale", "1");
  if (q.q) p.set("q", q.q);
  if (q.sort && q.sort !== "featured") p.set("sort", q.sort);
  return p.toString();
}

export function countActiveFilters(q: CatalogQuery, lockedCategory?: string): number {
  let n = 0;
  if (q.category && !lockedCategory) n++;
  n += q.colors?.length ?? 0;
  n += q.sizes?.length ?? 0;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) n++;
  if (q.isNew) n++;
  if (q.onSale) n++;
  return n;
}

/** Filters and sort live in the URL so results are shareable and survive back/forward. */
export function useShopQuery(lockedCategory?: string) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = useMemo(() => parseQuery(params, lockedCategory), [params, lockedCategory]);

  const replace = useCallback(
    (next: CatalogQuery) => {
      const qs = serializeQuery(next, lockedCategory);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, lockedCategory]
  );

  const update = useCallback((patch: Partial<CatalogQuery>) => replace({ ...query, ...patch }), [query, replace]);
  const clear = useCallback(() => replace({ sort: query.sort }), [replace, query.sort]);

  return { query, update, replace, clear, activeCount: countActiveFilters(query, lockedCategory) };
}
