"use client";

import { useActionState, useState, useTransition } from "react";
import { slugify } from "@/lib/slug";
import type { CategoryRow } from "@/lib/supabase/types";
import { deleteCategory, saveCategory, type FormState } from "@/app/(admin)/admin/(panel)/actions";
import { Field, inputClass, textareaClass } from "@/components/admin/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function CategoryForm({ category, productCount = 0 }: { category?: CategoryRow; productCount?: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveCategory.bind(null, category?.id ?? null), {});
  const [deleteState, setDeleteState] = useState<FormState>({});
  const [deleting, startDelete] = useTransition();
  const [label, setLabel] = useState(category?.label ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const errors = state.errors ?? {};
  const message = deleteState.message ?? state.message;
  const ok = deleteState.message ? deleteState.ok : state.ok;

  return (
    <form action={formAction} className="space-y-3 rounded-xs border border-hairline bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{category ? category.label : "New category"}</h2>
        {category ? <span className="text-[12px] text-muted">{productCount} products</span> : null}
      </div>
      {message ? <p role="status" className={cn("rounded-xs px-3 py-2 text-[12px]", ok ? "bg-sand" : "bg-oxblood/10 text-oxblood")}>{message}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label" name={`label-${category?.id ?? "new"}`} error={errors.label}>
          <input id={`label-${category?.id ?? "new"}`} name="label" value={label} onChange={(e) => { setLabel(e.target.value); if (!category) setSlug(slugify(e.target.value)); }} required className={inputClass} />
        </Field>
        <Field label="Slug" name={`slug-${category?.id ?? "new"}`} error={errors.slug}>
          <input id={`slug-${category?.id ?? "new"}`} name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="Description" name={`description-${category?.id ?? "new"}`} error={errors.description} className="sm:col-span-2">
          <textarea id={`description-${category?.id ?? "new"}`} name="description" rows={2} defaultValue={category?.description ?? ""} className={textareaClass} />
        </Field>
        <Field label="Sort order" name={`sortOrder-${category?.id ?? "new"}`} error={errors.sortOrder}>
          <input id={`sortOrder-${category?.id ?? "new"}`} name="sortOrder" type="number" min={0} defaultValue={category?.sort_order ?? 0} className={inputClass} />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : category ? "Save" : "Add category"}
        </Button>
        {category ? (
          <button
            type="button"
            disabled={deleting || productCount > 0}
            title={productCount > 0 ? "Move its products first" : undefined}
            onClick={() => window.confirm(`Delete “${category.label}”?`) && startDelete(async () => setDeleteState(await deleteCategory(category.id)))}
            className="text-[12px] text-oxblood underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
