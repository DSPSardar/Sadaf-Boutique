"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { buildWhatsAppUrl, generalEnquiryMessage } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  size?: "md" | "lg";
  block?: boolean;
  className?: string;
}

/** Inline "Order on WhatsApp" link. Opens WhatsApp with a prefilled message (mock ordering for now). */
export function WhatsAppButton({ message, label = "Order on WhatsApp", size = "md", block, className }: WhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xs bg-whatsapp text-[13px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#1ebe5b]",
        size === "lg" ? "h-12 px-6" : "h-11 px-5",
        block && "w-full",
        className
      )}
    >
      <WhatsAppGlyph />
      {label}
    </a>
  );
}

/** Floating WhatsApp entry point, positioned above the mobile bottom navigation. */
export function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const onProductPage = pathname.startsWith("/product/");
  return (
    <a
      href={buildWhatsAppUrl(generalEnquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed right-4 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform hover:scale-105 lg:right-6 lg:bottom-6",
        onProductPage ? "hidden lg:flex" : "flex"
      )}
    >
      <WhatsAppGlyph size={22} />
    </a>
  );
}

function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.23 8.24m4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28" />
    </svg>
  );
}
