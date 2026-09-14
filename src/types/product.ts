import type { ColorFamily } from "@/data/assets";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductImage {
  /** Media key — resolved to renditions by lib/images.ts (mock key or storage path). */
  assetId: string;
  alt: string;
  /** Present for database-backed media; mock assets look these up in assets.generated.ts. */
  blurDataURL?: string;
  width?: number;
  height?: number;
}

export interface ProductVideo {
  src: string;
  /** Poster asset id (rendered through the same responsive image pipeline). */
  posterAssetId: string;
}

export interface ProductColor {
  name: string;
  family: ColorFamily;
  hex: string;
}

export interface ProductDetails {
  fabric: string;
  work: string;
  pieces: string[];
  care: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  currency: "PKR";
  description: string;
  details: ProductDetails;
  colors: ProductColor[];
  sizes: string[];
  images: ProductImage[];
  video?: ProductVideo;
  isNew: boolean;
  /** Lower ranks appear first under "Featured" sorting. */
  featuredRank: number;
  stock: number;
  createdAt: string;
  occasion: string[];
  /** Search tokens (fabric, colours, occasion, garment words). */
  tags: string[];
  /** Only "active" products reach the storefront; present so admin views can reuse the type. */
  status?: "draft" | "active" | "archived";
}

export interface Category {
  slug: string;
  label: string;
  description: string;
  coverAssetId: string;
}

export interface CatalogQuery {
  category?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  onSale?: boolean;
  q?: string;
  sort?: SortKey;
}

export interface CartLine {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}
