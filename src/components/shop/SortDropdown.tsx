"use client";

import { ChevronDown } from "lucide-react";
import type { SortKey } from "@/types/product";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <label className="relative inline-flex h-9 items-center gap-1 rounded-xs border border-hairline bg-surface pl-3 pr-2 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors hover:border-ink">
      <span className="hidden text-muted sm:inline">Sort</span>
      <select value={value} onChange={(e) => onChange(e.target.value as SortKey)} aria-label="Sort products" className="appearance-none bg-transparent pr-5 outline-none">
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={1.5} className="pointer-events-none absolute right-2" />
    </label>
  );
}
