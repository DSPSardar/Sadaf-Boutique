import { CATEGORIES } from "@/data/categories";
import { PRODUCTS, PRODUCT_BY_ID, PRODUCT_BY_SLUG } from "@/data/products";
import type { CatalogQuery, Category, Product, SortKey } from "@/types/product";

/**
 * The only seam between UI and data. Pages and components talk to a `CatalogSource`;
 * today it is backed by the in-memory mock catalogue, later by an API/database.
 */
export interface CatalogSource {
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  query(query: CatalogQuery): Promise<Product[]>;
}

export const isOnSale = (p: Product): boolean => !!p.compareAtPrice && p.compareAtPrice > p.price;

export function filterProducts(products: Product[], q: CatalogQuery): Product[] {
  const colors = q.colors?.length ? new Set(q.colors) : null;
  const sizes = q.sizes?.length ? new Set(q.sizes) : null;
  const term = q.q?.trim().toLowerCase();
  return products.filter((p) => {
    if (q.category && p.category !== q.category) return false;
    if (q.minPrice !== undefined && p.price < q.minPrice) return false;
    if (q.maxPrice !== undefined && p.price > q.maxPrice) return false;
    if (q.isNew && !p.isNew) return false;
    if (q.onSale && !isOnSale(p)) return false;
    if (colors && !p.colors.some((c) => colors.has(c.family))) return false;
    if (sizes && !p.sizes.some((s) => sizes.has(s))) return false;
    if (term && !matchesSearch(p, term)) return false;
    return true;
  });
}

export function matchesSearch(p: Product, term: string): boolean {
  const tokens = term.split(/\s+/).filter(Boolean);
  const haystack = `${p.name} ${p.sku} ${p.category.replace("-", " ")} ${p.tags.join(" ")}`.toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

export function searchProducts(products: Product[], term: string, limit = 24): Product[] {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  const scored = products
    .filter((p) => matchesSearch(p, t))
    .map((p) => ({ p, score: p.name.toLowerCase().includes(t) ? 2 : 1 }));
  scored.sort((a, b) => b.score - a.score || a.p.featuredRank - b.p.featuredRank);
  return scored.slice(0, limit).map((s) => s.p);
}

export function sortProducts(products: Product[], sort: SortKey = "featured"): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    default:
      return list.sort((a, b) => a.featuredRank - b.featuredRank);
  }
}

export function getRelated(product: Product, products: Product[], limit = 8): Product[] {
  const families = new Set(product.colors.map((c) => c.family));
  return products
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      p,
      score:
        (p.category === product.category ? 3 : 0) +
        (p.colors.some((c) => families.has(c.family)) ? 2 : 0) +
        (p.occasion.some((o) => product.occasion.includes(o)) ? 1 : 0),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.p.featuredRank - b.p.featuredRank)
    .slice(0, limit)
    .map((s) => s.p);
}

export const mockCatalog: CatalogSource = {
  async getProducts() {
    return PRODUCTS;
  },
  async getProductBySlug(slug) {
    return PRODUCT_BY_SLUG.get(slug);
  },
  async getProductsByIds(ids) {
    return ids.map((id) => PRODUCT_BY_ID.get(id)).filter((p): p is Product => !!p);
  },
  async getCategories() {
    return CATEGORIES;
  },
  async query(q) {
    return sortProducts(filterProducts(PRODUCTS, q), q.sort);
  },
};

export const catalog: CatalogSource = mockCatalog;
