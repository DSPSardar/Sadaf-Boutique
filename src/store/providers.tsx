"use client";

import type { ReactNode } from "react";
import { CatalogProvider } from "@/store/catalog";
import type { Product } from "@/types/product";
import { CartProvider } from "@/store/cart";
import { UIProvider } from "@/store/ui";
import { WishlistProvider } from "@/store/wishlist";

export function AppProviders({ products, children }: { products: Product[]; children: ReactNode }) {
  return (
    <CatalogProvider products={products}>
      <UIProvider>
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </UIProvider>
    </CatalogProvider>
  );
}
