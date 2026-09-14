"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDialog } from "@/hooks/useDialog";
import { IconButton } from "@/components/ui/IconButton";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** "right" = side sheet everywhere; "responsive" = bottom sheet on mobile, side sheet on desktop. */
  side?: "right" | "responsive";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Accessible slide-in panel used for cart, filters and the mobile menu. */
export function Drawer({ open, onClose, title, side = "right", children, footer, className }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(open, onClose, panelRef);
  if (!open) return null;

  const responsive = side === "responsive";
  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 animate-fade-in" tabIndex={-1} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute flex flex-col bg-surface shadow-sheet",
          responsive
            ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-md animate-slide-in-up lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[400px] lg:max-h-none lg:rounded-none lg:animate-slide-in-right"
            : "inset-y-0 right-0 w-full max-w-[420px] animate-slide-in-right",
          className
        )}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline pl-5 pr-2">
          <h2 className="font-display text-xl">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={20} strokeWidth={1.5} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? <footer className="shrink-0 border-t border-hairline p-4 pb-safe">{footer}</footer> : null}
      </div>
    </div>
  );
}
