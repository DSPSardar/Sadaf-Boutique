"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { cardSrc } from "@/lib/images";
import { formatPKR } from "@/lib/format";
import { cartOrderMessage } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

/** Cart side sheet. Checkout is intentionally a mock — orders go through WhatsApp for now. */
export function CartDrawer() {
  const { cartOpen, closeCart } = useUI();
  const { lines, subtotal, count, setQuantity, remove } = useCart();

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      title={count ? `Bag (${count})` : "Bag"}
      footer={
        lines.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPKR(subtotal)}</span>
            </div>
            <p className="text-[11px] text-muted">Shipping and any stitching charges are confirmed on WhatsApp before payment.</p>
            <WhatsAppButton block message={cartOrderMessage(lines, subtotal)} />
            <Button block variant="secondary" disabled title="Online checkout coming soon">
              Checkout — coming soon
            </Button>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} strokeWidth={1.2} />}
          title="Your bag is empty"
          description="Save pieces you love to your wishlist, or add them here to order on WhatsApp."
          action={
            <Link href="/shop" onClick={closeCart}>
              <Button>Continue shopping</Button>
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-hairline px-5">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-3 py-4">
              <Link href={`/product/${l.product.slug}`} onClick={closeCart} className="w-20 shrink-0 overflow-hidden rounded-xs bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cardSrc(l.product.images[0].assetId, 400)} alt="" width={80} height={100} className="aspect-[4/5] h-auto w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/product/${l.product.slug}`} onClick={closeCart} className="line-clamp-2 text-sm leading-snug hover:text-gold">
                  {l.product.name}
                </Link>
                <p className="mt-0.5 text-[12px] text-muted">
                  {l.size} · {l.color}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex h-8 items-center rounded-xs border border-hairline">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(l.key, l.quantity - 1)} className="flex h-full w-8 items-center justify-center hover:bg-sand">
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">{l.quantity}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(l.key, l.quantity + 1)} className="flex h-full w-8 items-center justify-center hover:bg-sand">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{formatPKR(l.product.price * l.quantity)}</span>
                </div>
              </div>
              <button type="button" aria-label={`Remove ${l.product.name}`} onClick={() => remove(l.key)} className="self-start p-1 text-muted transition-colors hover:text-oxblood">
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
