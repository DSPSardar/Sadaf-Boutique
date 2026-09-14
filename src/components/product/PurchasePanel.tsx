"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { productOrderMessage } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { WishlistButton } from "@/components/product/WishlistButton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

interface PurchasePanelProps {
  product: Product;
  /** Compact layout for the quick-view modal. */
  compact?: boolean;
  /** Renders a sticky bottom bar on phones (product page only). */
  stickyBar?: boolean;
  onAdded?: () => void;
}

/** Size / colour / quantity selection with Add to Bag and WhatsApp actions. Shared by quick view and product page. */
export function PurchasePanel({ product, compact, stickyBar, onAdded }: PurchasePanelProps) {
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { add } = useCart();
  const { openCart } = useUI();
  const soldOut = product.stock === 0;

  const addToBag = () => {
    if (!size) {
      setError("Please select a size");
      return;
    }
    setError(null);
    add({ productId: product.id, size, color: color.name, quantity });
    onAdded?.();
    openCart();
  };

  const message = productOrderMessage(product, { size: size ?? undefined, color: color.name, quantity });

  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-5")}>
      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="eyebrow">
            Colour — <span className="text-ink normal-case tracking-normal">{color.name}</span>
          </legend>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c.family}
              type="button"
              aria-label={c.name}
              aria-pressed={c.family === color.family}
              onClick={() => setColor(c)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                c.family === color.family ? "border-ink ring-2 ring-ivory ring-inset" : "border-hairline hover:border-muted"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="eyebrow">
            Size{size ? <span className="text-ink normal-case tracking-normal"> — {size}</span> : null}
          </legend>
          <button type="button" className="text-[11px] underline underline-offset-4 hover:text-gold">
            Size guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={size === s}
              onClick={() => {
                setSize(s);
                setError(null);
              }}
              className={cn(
                "h-10 min-w-11 rounded-xs border px-3 text-[12px] font-medium uppercase tracking-[0.1em] transition-colors",
                size === s ? "border-ink bg-ink text-ivory" : "border-hairline hover:border-ink"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-[12px] text-oxblood">
            {error}
          </p>
        ) : null}
      </fieldset>

      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 items-center rounded-xs border border-hairline">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-full w-10 items-center justify-center hover:bg-sand">
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="flex h-full w-10 items-center justify-center hover:bg-sand">
            <Plus size={14} />
          </button>
        </div>
        <p className="text-[12px] text-muted">{soldOut ? "Currently sold out — order on WhatsApp to be notified." : product.stock <= 3 ? `Only ${product.stock} left` : "In stock · ships in 2–3 weeks"}</p>
      </div>

      <div className={cn("grid gap-2", stickyBar && "max-lg:hidden")}>
        <Button size="lg" block onClick={addToBag} disabled={soldOut}>
          {soldOut ? "Sold out" : "Add to bag"}
        </Button>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <WhatsAppButton block size="lg" message={message} />
          <WishlistButton variant="inline" productId={product.id} productName={product.name} className="h-12" />
        </div>
      </div>

      {stickyBar ? (
        <div className="fixed inset-x-0 bottom-14 z-30 flex gap-2 border-t border-hairline bg-ivory/95 p-3 backdrop-blur-sm lg:hidden">
          <Button block onClick={addToBag} disabled={soldOut}>
            {soldOut ? "Sold out" : "Add to bag"}
          </Button>
          <WhatsAppButton block message={message} label="WhatsApp" />
        </div>
      ) : null}
    </div>
  );
}
