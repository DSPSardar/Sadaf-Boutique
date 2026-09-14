"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/types/product";

interface UIContextValue {
  searchOpen: boolean;
  cartOpen: boolean;
  menuOpen: boolean;
  quickViewProduct: Product | null;
  openSearch: () => void;
  closeSearch: () => void;
  openCart: () => void;
  closeCart: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

/** Global open/closed state for overlays that are mounted once in the root layout. */
export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openQuickView = useCallback((p: Product) => setQuickViewProduct(p), []);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  const value = useMemo(
    () => ({ searchOpen, cartOpen, menuOpen, quickViewProduct, openSearch, closeSearch, openCart, closeCart, openMenu, closeMenu, openQuickView, closeQuickView }),
    [searchOpen, cartOpen, menuOpen, quickViewProduct, openSearch, closeSearch, openCart, closeCart, openMenu, closeMenu, openQuickView, closeQuickView]
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
