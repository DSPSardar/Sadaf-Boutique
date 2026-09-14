"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@/types/product";

interface CatalogContextValue {
  products: Product[];
  byId: Map<string, Product>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

/**
 * The active catalogue, rendered on the server and handed to client components (cart line
 * resolution, wishlist, search). Replaces direct imports of the mock dataset on the client.
 */
export function CatalogProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const value = useMemo(() => ({ products, byId: new Map(products.map((p) => [p.id, p])) }), [products]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
