import type { ColorFamily } from "@/data/assets";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductImage {
  /** Photo asset id — resolved to renditions by lib/images.ts. */
  assetId: string;
  alt: string;
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
