"use client";

import { useActionState, useState } from "react";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/data/products";
import { slugify } from "@/lib/slug";
import type { ProductColorJson, ProductRow } from "@/lib/supabase/types";
import { saveProduct, type FormState } from "@/app/(admin)/admin/(panel)/actions";
import { Field, inputClass, textareaClass } from "@/components/admin/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface ProductFormProps {
  productId?: string;
  categories: { id: string; label: string }[];
  defaults?: Partial<ProductRow>;
}

const OCCASIONS = ["Bridal", "Walima", "Mehndi", "Formal", "Festive"];

/** Create/edit form backed by the saveProduct server action; validation errors render inline. */
export function ProductForm({ productId, categories, defaults = {} }: ProductFormProps) {
  const action = saveProduct.bind(null, productId ?? null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const errors = state.errors ?? {};

  const [name, setName] = useState(defaults.name ?? "");
  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!defaults.slug);
  const [sizes, setSizes] = useState<string[]>(defaults.sizes ?? ["XS", "S", "M", "L", "XL", "Custom"]);
  const [occasion, setOccasion] = useState<string[]>(defaults.occasion ?? []);
  const [colors, setColors] = useState<ProductColorJson[]>(defaults.colors ?? []);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const addColor = (family: string) => {
    const opt = COLOR_OPTIONS.find((c) => c.family === family);
    if (!opt || colors.some((c) => c.family === family)) return;
    setColors([...colors, { name: opt.name, family: opt.family, hex: opt.hex }]);
  };

  return (
    <form action={formAction} className="space-y-6 rounded-xs border border-hairline bg-surface p-4 lg:p-6">
      {state.message ? (
        <p role="status" className={cn("rounded-xs px-3 py-2 text-sm", state.ok ? "bg-sand" : "bg-oxblood/10 text-oxblood")}>
          {state.message}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors.name} className="sm:col-span-2">
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
            className={inputClass}
            placeholder="Mahnoor Tissue Bridal Set"
          />
        </Field>
        <Field label="Slug" name="slug" error={errors.slug} hint="Used in the product URL">
          <input id="slug" name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required className={inputClass} />
        </Field>
        <Field label="SKU" name="sku" error={errors.sku}>
          <input id="sku" name="sku" defaultValue={defaults.sku ?? ""} required className={inputClass} />
        </Field>
        <Field label="Category" name="categoryId" error={errors.categoryId}>
          <select id="categoryId" name="categoryId" defaultValue={defaults.category_id ?? ""} required className={inputClass}>
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" name="status" error={errors.status}>
          <select id="status" name="status" defaultValue={defaults.status ?? "draft"} className={inputClass}>
            <option value="draft">Draft (hidden)</option>
            <option value="active">Live</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Price (PKR)" name="price" error={errors.price}>
          <input id="price" name="price" type="number" min={0} step={500} defaultValue={defaults.price ?? ""} required className={inputClass} />
        </Field>
        <Field label="Compare-at price (PKR)" name="compareAtPrice" error={errors.compareAtPrice} hint="Optional: original price when on sale">
          <input id="compareAtPrice" name="compareAtPrice" type="number" min={0} step={500} defaultValue={defaults.compare_at_price ?? ""} className={inputClass} />
        </Field>
        <Field label="Stock" name="stock" error={errors.stock}>
          <input id="stock" name="stock" type="number" min={0} defaultValue={defaults.stock ?? 1} className={inputClass} />
        </Field>
        <Field label="Featured rank" name="featuredRank" error={errors.featuredRank} hint="Lower shows first under “Featured”">
          <input id="featuredRank" name="featuredRank" type="number" min={0} defaultValue={defaults.featured_rank ?? 1000} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="isNew" defaultChecked={defaults.is_new ?? true} className="h-4 w-4 accent-ink" />
          Show the “New” tag
        </label>
      </section>

      <section className="space-y-4">
        <Field label="Description" name="description" error={errors.description}>
          <textarea id="description" name="description" rows={4} defaultValue={defaults.description ?? ""} className={textareaClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fabric" name="fabric" error={errors.fabric}>
            <input id="fabric" name="fabric" defaultValue={defaults.fabric ?? ""} className={inputClass} placeholder="Silk velvet" />
          </Field>
          <Field label="Work" name="work" error={errors.work}>
            <input id="work" name="work" defaultValue={defaults.work ?? ""} className={inputClass} placeholder="Zardozi, dabka and pearl work" />
          </Field>
          <Field label="Pieces" name="pieces" error={errors.pieces} hint="Comma separated">
            <input id="pieces" name="pieces" defaultValue={(defaults.pieces ?? []).join(", ")} className={inputClass} placeholder="Shirt, Lehenga, Dupatta" />
          </Field>
          <Field label="Care" name="care" error={errors.care}>
            <input id="care" name="care" defaultValue={defaults.care ?? "Dry clean only."} className={inputClass} />
          </Field>
          <Field label="Tags" name="tags" error={errors.tags} hint="Comma separated; used by search" className="sm:col-span-2">
            <input id="tags" name="tags" defaultValue={(defaults.tags ?? []).join(", ")} className={inputClass} placeholder="velvet, bridal, red" />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow mb-2">Sizes</p>
          <input type="hidden" name="sizes" value={sizes.join(",")} />
          <div className="flex flex-wrap gap-2">
            {[...SIZE_OPTIONS, "Unstitched"].map((s) => (
              <Chip key={s} active={sizes.includes(s)} onClick={() => toggle(sizes, setSizes, s)}>
                {s}
              </Chip>
            ))}
          </div>
          {errors.sizes ? <p className="mt-1 text-[12px] text-oxblood">{errors.sizes}</p> : null}
        </div>
        <div>
          <p className="eyebrow mb-2">Occasion</p>
          <input type="hidden" name="occasion" value={occasion.join(",")} />
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <Chip key={o} active={occasion.includes(o)} onClick={() => toggle(occasion, setOccasion, o)}>
                {o}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-2">Colours</p>
          <input type="hidden" name="colors" value={JSON.stringify(colors)} />
          <div className="flex flex-wrap gap-2">
            {colors.map((c, i) => (
              <span key={c.family} className="inline-flex h-9 items-center gap-2 rounded-full border border-hairline pl-1.5 pr-1 text-[12px]">
                <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                <input
                  aria-label={`Colour ${i + 1} name`}
                  value={c.name}
                  onChange={(e) => setColors(colors.map((x) => (x.family === c.family ? { ...x, name: e.target.value } : x)))}
                  className="w-28 bg-transparent outline-none"
                />
                <button type="button" aria-label={`Remove ${c.name}`} onClick={() => setColors(colors.filter((x) => x.family !== c.family))} className="rounded-full px-1.5 text-muted hover:text-oxblood">
                  ×
                </button>
              </span>
            ))}
            <select aria-label="Add colour" value="" onChange={(e) => addColor(e.target.value)} className="h-9 rounded-full border border-dashed border-hairline bg-transparent px-3 text-[12px]">
              <option value="">+ Add colour</option>
              {COLOR_OPTIONS.filter((o) => !colors.some((c) => c.family === o.family)).map((o) => (
                <option key={o.family} value={o.family}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          {errors.colors ? <p className="mt-1 text-[12px] text-oxblood">{errors.colors}</p> : null}
        </div>
      </section>

      <div className="flex items-center gap-3 border-t border-hairline pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
        </Button>
        {productId ? <p className="text-[12px] text-muted">Changes go live on the storefront within a few seconds.</p> : null}
      </div>
    </form>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("h-9 rounded-full border px-3.5 text-[12px] transition-colors", active ? "border-ink bg-ink text-ivory" : "border-hairline hover:border-ink")}>
      {children}
    </button>
  );
}
