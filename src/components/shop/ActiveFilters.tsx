"use client";

import { X } from "lucide-react";
import { categoryLabel } from "@/data/categories";
import { COLOR_OPTIONS } from "@/data/products";
import { formatPKR } from "@/lib/format";
import type { CatalogQuery } from "@/types/product";

interface ActiveFiltersProps {
  query: CatalogQuery;
  lockedCategory?: string;
  onUpdate: (patch: Partial<CatalogQuery>) => void;
  onClear: () => void;
}

/** Removable chips for every active filter, shown under the toolbar. */
export function ActiveFilters({ query, lockedCategory, onUpdate, onClear }: ActiveFiltersProps) {
  const chips: { label: string; remove: () => void }[] = [];
  if (query.category && !lockedCategory) chips.push({ label: categoryLabel(query.category), remove: () => onUpdate({ category: undefined }) });
  for (const c of query.colors ?? []) {
    chips.push({ label: COLOR_OPTIONS.find((o) => o.family === c)?.name ?? c, remove: () => onUpdate({ colors: query.colors?.filter((x) => x !== c) }) });
  }
  for (const s of query.sizes ?? []) chips.push({ label: `Size ${s}`, remove: () => onUpdate({ sizes: query.sizes?.filter((x) => x !== s) }) });
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const label = query.minPrice !== undefined && query.maxPrice !== undefined ? `${formatPKR(query.minPrice)} – ${formatPKR(query.maxPrice)}` : query.minPrice !== undefined ? `From ${formatPKR(query.minPrice)}` : `Up to ${formatPKR(query.maxPrice!)}`;
    chips.push({ label, remove: () => onUpdate({ minPrice: undefined, maxPrice: undefined }) });
  }
  if (query.isNew) chips.push({ label: "New arrivals", remove: () => onUpdate({ isNew: false }) });
  if (query.onSale) chips.push({ label: "On sale", remove: () => onUpdate({ onSale: false }) });
  if (query.q) chips.push({ label: `“${query.q}”`, remove: () => onUpdate({ q: undefined }) });

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 animate-fade-in" aria-label="Active filters">
      {chips.map((c) => (
        <button key={c.label} type="button" onClick={c.remove} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-sand pl-3 pr-2 text-[12px] transition-colors hover:bg-hairline">
          {c.label}
          <X size={12} strokeWidth={2} aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button type="button" onClick={onClear} className="text-[12px] underline underline-offset-4 hover:text-gold">
        Clear all
      </button>
    </div>
  );
}
