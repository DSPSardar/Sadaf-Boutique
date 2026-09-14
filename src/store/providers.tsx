"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/store/cart";
import { UIProvider } from "@/store/ui";
import { WishlistProvider } from "@/store/wishlist";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </UIProvider>
  );
}
