"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/data/products";
import { filterProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPKR } from "@/lib/format";
import type { CatalogQuery, Product } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "Under Rs 25,000", max: 25000 },
  { label: "Rs 25,000 – 50,000", min: 25000, max: 50000 },
  { label: "Rs 50,000 – 100,000", min: 50000, max: 100000 },
  { label: "Rs 100,000 and above", min: 100000 },
];

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  query: CatalogQuery;
  lockedCategory?: string;
  onApply: (q: CatalogQuery) => void;
}

/** Bottom sheet on phones, side sheet on desktop. Edits a draft and applies on "Show results". */
export function FilterDrawer({ open, onClose, products, query, lockedCategory, onApply }: FilterDrawerProps) {
  const [draft, setDraft] = useState<CatalogQuery>(query);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(query);
  }

  const count = filterProducts(products, draft).length;
  const toggleIn = (key: "colors" | "sizes", v: string) =>
    setDraft((d) => {
      const list = d[key] ?? [];
      return { ...d, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      side="responsive"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDraft({ sort: draft.sort, category: lockedCategory })} className="shrink-0">
            Clear all
          </Button>
          <Button
            block
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Show {count} {count === 1 ? "result" : "results"}
          </Button>
        </div>
      }
    >
      <div className="divide-y divide-hairline px-5">
        {!lockedCategory ? (
          <Section title="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip key={c.slug} active={draft.category === c.slug} onClick={() => setDraft((d) => ({ ...d, category: d.category === c.slug ? undefined : c.slug }))}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </Section>
        ) : null}

        <Section title="Price">
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((p) => {
              const active = draft.minPrice === p.min && draft.maxPrice === p.max;
              return (
                <Chip key={p.label} active={active} onClick={() => setDraft((d) => (active ? { ...d, minPrice: undefined, maxPrice: undefined } : { ...d, minPrice: p.min, maxPrice: p.max }))}>
                  {p.label}
                </Chip>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <NumberField label="Min" value={draft.minPrice} onChange={(v) => setDraft((d) => ({ ...d, minPrice: v }))} />
            <NumberField label="Max" value={draft.maxPrice} onChange={(v) => setDraft((d) => ({ ...d, maxPrice: v }))} />
          </div>
        </Section>

        <Section title="Colour">
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const active = draft.colors?.includes(c.family);
              return (
                <button
                  key={c.family}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleIn("colors", c.family)}
                  className={cn("inline-flex h-9 items-center gap-2 rounded-full border pl-1.5 pr-3 text-[12px] transition-colors", active ? "border-ink bg-ink text-ivory" : "border-hairline hover:border-ink")}
                >
                  <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((s) => (
              <Chip key={s} active={!!draft.sizes?.includes(s)} onClick={() => toggleIn("sizes", s)}>
                {s}
              </Chip>
            ))}
            <Chip active={!!draft.sizes?.includes("Unstitched")} onClick={() => toggleIn("sizes", "Unstitched")}>
              Unstitched
            </Chip>
          </div>
        </Section>

        <Section title="Availability">
          <div className="flex flex-col gap-3">
            <Toggle label="New arrivals only" checked={!!draft.isNew} onChange={(v) => setDraft((d) => ({ ...d, isNew: v }))} />
            <Toggle label="On sale" checked={!!draft.onSale} onChange={(v) => setDraft((d) => ({ ...d, onSale: v }))} />
          </div>
        </Section>
      </div>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-5">
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("h-9 rounded-full border px-3.5 text-[12px] transition-colors", active ? "border-ink bg-ink text-ivory" : "border-hairline hover:border-ink")}>
      {children}
    </button>
  );
}

function NumberField({ label, value, onChange }: { label: string; value?: number; onChange: (v?: number) => void }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-xs border border-hairline px-3 text-[12px] focus-within:border-ink">
      <span className="text-muted">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={500}
        value={value ?? ""}
        placeholder={label === "Min" ? "0" : formatPKR(300000).replace("Rs ", "")}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        aria-label={`${label} price`}
        className="w-full bg-transparent text-sm tabular-nums outline-none"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      {label}
      <span className="relative inline-flex">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className={cn("flex h-5 w-5 items-center justify-center rounded-xs border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-gold", checked ? "border-ink bg-ink text-ivory" : "border-hairline")}>
          {checked ? <Check size={14} strokeWidth={2.5} /> : null}
        </span>
      </span>
    </label>
  );
}
