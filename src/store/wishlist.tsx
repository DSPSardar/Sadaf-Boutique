"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

interface WishlistContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  hydrated: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds, hydrated] = useLocalStorageState<string[]>("sadaf.wishlist", []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])), [setIds]);
  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), [setIds]);
  const clear = useCallback(() => setIds([]), [setIds]);
  const value = useMemo(() => ({ ids, has, toggle, remove, clear, hydrated }), [ids, has, toggle, remove, clear, hydrated]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
