"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { ProductStatus } from "@/lib/supabase/types";
import { deleteProduct, setProductStatus } from "@/app/(admin)/admin/(panel)/actions";

export function ProductRowActions({ id, status }: { id: string; status: ProductStatus }) {
  const [pending, start] = useTransition();
  const next: ProductStatus = status === "active" ? "draft" : "active";
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setProductStatus(id, next))}
        className="rounded-xs border border-hairline px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors hover:border-ink disabled:opacity-50"
      >
        {status === "active" ? "Unpublish" : "Set live"}
      </button>
      {status !== "archived" ? (
        <button type="button" disabled={pending} onClick={() => start(() => setProductStatus(id, "archived"))} className="text-[11px] text-muted underline-offset-4 hover:underline disabled:opacity-50">
          Archive
        </button>
      ) : null}
    </div>
  );
}

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Delete “${name}” and all of its photos? This cannot be undone.`)) start(() => deleteProduct(id));
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-xs border border-hairline px-3 text-[12px] text-oxblood transition-colors hover:border-oxblood disabled:opacity-50"
    >
      <Trash2 size={14} strokeWidth={1.5} /> Delete
    </button>
  );
}
