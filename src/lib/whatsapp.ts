import type { Product } from "@/types/product";
import { formatPKR } from "@/lib/format";

/**
 * WhatsApp ordering is frontend-only for now: we deep-link into WhatsApp with a prefilled
 * message. Swap `buildWhatsAppUrl` for an API call when order automation is connected.
 */
const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export interface OrderSelection {
  size?: string;
  color?: string;
  quantity?: number;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(product: Product, selection: OrderSelection = {}): string {
  const lines = [
    `Hello Sadaf Boutique, I would like to order:`,
    ``,
    `• ${product.name} (SKU ${product.sku})`,
    `  Price: ${formatPKR(product.price)}`,
  ];
  if (selection.size) lines.push(`  Size: ${selection.size}`);
  if (selection.color) lines.push(`  Colour: ${selection.color}`);
  lines.push(`  Quantity: ${selection.quantity ?? 1}`);
  lines.push(``, `${SITE}/product/${product.slug}`);
  return lines.join("\n");
}

export function cartOrderMessage(
  lines: { product: Product; size: string; color: string; quantity: number }[],
  subtotal: number
): string {
  const items = lines.map(
    (l) => `• ${l.product.name} (SKU ${l.product.sku}) — ${l.size} / ${l.color} × ${l.quantity} — ${formatPKR(l.product.price * l.quantity)}`
  );
  return [`Hello Sadaf Boutique, I would like to order:`, ``, ...items, ``, `Subtotal: ${formatPKR(subtotal)}`].join("\n");
}

export function generalEnquiryMessage(): string {
  return "Hello Sadaf Boutique, I have a question about your collection.";
}
