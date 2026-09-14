import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control + inline error, used by the admin forms. */
export function Field({ label, name, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={name} className="eyebrow">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-[12px] text-oxblood">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass = "h-10 w-full rounded-xs border border-hairline bg-surface px-3 text-sm outline-none transition-colors focus:border-ink disabled:bg-sand";
export const textareaClass = "w-full rounded-xs border border-hairline bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-ink";
