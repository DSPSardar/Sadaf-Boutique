"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useCatalog } from "@/store/catalog";
import type { CartLine, Product } from "@/types/product";

export interface ResolvedCartLine extends CartLine {
  product: Product;
  key: string;
}

interface CartContextValue {
  lines: ResolvedCartLine[];
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const lineKey = (l: CartLine) => `${l.productId}|${l.size}|${l.color}`;

/**
 * Cart is UI-only: lines live in localStorage and resolve against the mock catalogue.
 * A backend can replace `add/setQuantity/remove` with API calls without touching the UI.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw, hydrated] = useLocalStorageState<CartLine[]>("sadaf.cart", []);
  const { byId } = useCatalog();

  const lines = useMemo<ResolvedCartLine[]>(
    () =>
      raw
        .map((l) => {
          const product = byId.get(l.productId);
          return product ? { ...l, product, key: lineKey(l) } : null;
        })
        .filter((l): l is ResolvedCartLine => !!l),
    [raw, byId]
  );

  const add = useCallback(
    (line: CartLine) =>
      setRaw((prev) => {
        const key = lineKey(line);
        const existing = prev.find((l) => lineKey(l) === key);
        if (existing) return prev.map((l) => (lineKey(l) === key ? { ...l, quantity: l.quantity + line.quantity } : l));
        return [line, ...prev];
      }),
    [setRaw]
  );
  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      setRaw((prev) => (quantity <= 0 ? prev.filter((l) => lineKey(l) !== key) : prev.map((l) => (lineKey(l) === key ? { ...l, quantity } : l)))),
    [setRaw]
  );
  const remove = useCallback((key: string) => setRaw((prev) => prev.filter((l) => lineKey(l) !== key)), [setRaw]);
  const clear = useCallback(() => setRaw([]), [setRaw]);

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + l.quantity * l.product.price, 0);

  const value = useMemo(
    () => ({ lines, count, subtotal, add, setQuantity, remove, clear, hydrated }),
    [lines, count, subtotal, add, setQuantity, remove, clear, hydrated]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
