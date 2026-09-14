import type { Category } from "@/types/product";

/** Catalogue categories grounded in the boutique's actual stock (bridal & formal wear). */
export const CATEGORIES: Category[] = [
  {
    slug: "bridal",
    label: "Bridal",
    description: "Signature bridal ensembles in velvet, tissue and net with hand-embellished zardozi work.",
    coverAssetId: "1c7c42b6",
  },
  {
    slug: "luxury-formals",
    label: "Luxury Formals",
    description: "Tissue and silk formals for walima, receptions and evening occasions.",
    coverAssetId: "5451df09",
  },
  {
    slug: "lehenga-choli",
    label: "Lehenga & Choli",
    description: "Flowing lehengas with embellished cholis for mehndi, walima and festive evenings.",
    coverAssetId: "4a684780",
  },
  {
    slug: "gharara-sharara",
    label: "Gharara & Sharara",
    description: "Traditional gharara and sharara sets with heavy gota and zardozi borders.",
    coverAssetId: "21baac63",
  },
  {
    slug: "velvet",
    label: "Velvet",
    description: "Winter-weight silk velvet pieces with kora, dabka and pearl embroidery.",
    coverAssetId: "489c01b6",
  },
  {
    slug: "embroidered-suits",
    label: "Embroidered Suits",
    description: "Raw silk three-piece suits with resham and tilla embroidery.",
    coverAssetId: "2a1d6ecf",
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function categoryLabel(slug: string): string {
  return CATEGORY_BY_SLUG.get(slug)?.label ?? slug;
}
