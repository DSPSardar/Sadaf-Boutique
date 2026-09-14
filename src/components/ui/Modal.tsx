"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDialog } from "@/hooks/useDialog";
import { IconButton } from "@/components/ui/IconButton";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}

/** Centred dialog on desktop, full-height sheet on mobile. */
export function Modal({ open, onClose, label, children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(open, onClose, panelRef);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50 animate-fade-in" tabIndex={-1} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-md bg-surface shadow-sheet animate-slide-in-up sm:max-h-[90vh] sm:max-w-5xl sm:rounded-sm sm:animate-scale-in",
          className
        )}
      >
        <IconButton label="Close" onClick={onClose} className="absolute top-2 right-2 z-10 bg-surface/80 backdrop-blur-sm">
          <X size={20} strokeWidth={1.5} />
        </IconButton>
        {children}
      </div>
    </div>
  );
}
