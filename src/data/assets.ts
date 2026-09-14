/**
 * Hand-curated metadata for the boutique's real product photography.
 * `id` is the first 8 characters of the source filename in assets/source/.
 * Generated sizes/blur placeholders live in assets.generated.ts (do not edit that file by hand).
 */
export type ColorFamily =
  | "red"
  | "maroon"
  | "gold"
  | "blue"
  | "navy"
  | "teal"
  | "pink"
  | "blush"
  | "orange"
  | "silver"
  | "multi";

export type LookId =
  | "gold-tissue"
  | "royal-blue-silk"
  | "red-velvet-bridal"
  | "maroon-gharara"
  | "pink-lehenga"
  | "blush-net-bridal"
  | "mehndi-lehenga"
  | "silver-tissue-pair"
  | "teal-silk"
  | "navy-kameez"
  | "festive-rack";

export interface PhotoAsset {
  id: string;
  /** Which garment family this photo belongs to. */
  look: LookId;
  /** Short note on what the photo shows; used to pick primary vs. detail shots. */
  shot: "full" | "detail" | "model" | "rack";
  /** True when the photo is of a screen (lower quality, keep as secondary image). */
  screen?: boolean;
  /** Fraction of the bottom to trim before processing (removes UI chrome on screenshots). */
  trimBottom?: number;
}

export interface Look {
  id: LookId;
  /** Human name used to build product names. */
  garment: string;
  colors: ColorFamily[];
  fabric: string;
  work: string;
  occasion: ("Bridal" | "Walima" | "Mehndi" | "Formal" | "Festive")[];
  categories: string[];
  /** Base price band in PKR. */
  price: [number, number];
  pieces: string[];
  video?: boolean;
}

export const LOOKS: Look[] = [
  {
    id: "gold-tissue",
    garment: "Tissue Bridal Set",
    colors: ["gold"],
    fabric: "Pure tissue silk",
    work: "Hand-embellished zardozi, dabka and sequin work",
    occasion: ["Walima", "Bridal"],
    categories: ["bridal", "luxury-formals"],
    price: [98000, 285000],
    pieces: ["Long shirt", "Lehenga or trousers", "Dupatta"],
    video: true,
  },
  {
    id: "royal-blue-silk",
    garment: "Silk Embroidered Suit",
    colors: ["blue"],
    fabric: "Raw silk",
    work: "Floral resham and tilla embroidery with maroon accents",
    occasion: ["Formal", "Festive"],
    categories: ["embroidered-suits", "luxury-formals"],
    price: [24500, 58000],
    pieces: ["Kameez", "Trousers", "Dupatta"],
    video: true,
  },
  {
    id: "red-velvet-bridal",
    garment: "Velvet Zardozi Bridal",
    colors: ["red", "maroon"],
    fabric: "Silk velvet",
    work: "Heavy zardozi, kora, dabka and pearl neckline",
    occasion: ["Bridal"],
    categories: ["velvet", "bridal"],
    price: [120000, 285000],
    pieces: ["Shirt", "Lehenga", "Velvet dupatta"],
    video: true,
  },
  {
    id: "maroon-gharara",
    garment: "Bridal Gharara Set",
    colors: ["maroon"],
    fabric: "Silk with net dupatta",
    work: "All-over gold zardozi and gota border",
    occasion: ["Bridal", "Walima"],
    categories: ["gharara-sharara", "bridal"],
    price: [85000, 210000],
    pieces: ["Short shirt", "Gharara", "Dupatta"],
    video: true,
  },
  {
    id: "pink-lehenga",
    garment: "Lehenga Choli",
    colors: ["pink", "blush"],
    fabric: "Net and organza",
    work: "Sequin, cutdana and pearl embellishment",
    occasion: ["Walima", "Festive"],
    categories: ["lehenga-choli", "bridal"],
    price: [68000, 165000],
    pieces: ["Choli", "Lehenga", "Dupatta"],
    video: true,
  },
  {
    id: "blush-net-bridal",
    garment: "Net Bridal Dupatta Set",
    colors: ["blush", "pink"],
    fabric: "Net with silk lining",
    work: "Scattered sequins with hand-finished borders",
    occasion: ["Walima", "Bridal"],
    categories: ["bridal", "luxury-formals"],
    price: [55000, 140000],
    pieces: ["Shirt", "Lehenga", "Net dupatta"],
  },
  {
    id: "mehndi-lehenga",
    garment: "Mehndi Lehenga",
    colors: ["pink", "orange"],
    fabric: "Crushed silk with net dupatta",
    work: "Gota and mirror work with contrast choli",
    occasion: ["Mehndi", "Festive"],
    categories: ["lehenga-choli"],
    price: [32000, 78000],
    pieces: ["Choli", "Lehenga", "Dupatta"],
    video: true,
  },
  {
    id: "silver-tissue-pair",
    garment: "Tissue Two-Piece",
    colors: ["silver"],
    fabric: "Tissue silk",
    work: "Light sequin and pearl detailing",
    occasion: ["Formal"],
    categories: ["luxury-formals"],
    price: [18500, 42000],
    pieces: ["Shirt", "Trousers"],
    video: true,
  },
  {
    id: "teal-silk",
    garment: "Silk Suit",
    colors: ["teal", "red"],
    fabric: "Raw silk",
    work: "Tilla embroidery with contrast red dupatta",
    occasion: ["Formal", "Festive"],
    categories: ["embroidered-suits"],
    price: [22000, 49000],
    pieces: ["Kameez", "Trousers", "Dupatta"],
  },
  {
    id: "navy-kameez",
    garment: "Embroidered Kameez",
    colors: ["navy", "blue"],
    fabric: "Raw silk",
    work: "Floral resham embroidery",
    occasion: ["Formal"],
    categories: ["embroidered-suits"],
    price: [19500, 39000],
    pieces: ["Kameez", "Trousers"],
  },
  {
    id: "festive-rack",
    garment: "Festive Lehenga",
    colors: ["multi"],
    fabric: "Silk and net",
    work: "Assorted festive embellishment",
    occasion: ["Festive", "Mehndi"],
    categories: ["lehenga-choli"],
    price: [28000, 64000],
    pieces: ["Choli", "Lehenga", "Dupatta"],
    video: true,
  },
];

export const ASSETS: PhotoAsset[] = [
  { id: "0380833b", look: "gold-tissue", shot: "full" },
  { id: "03ed0b9a", look: "royal-blue-silk", shot: "full", screen: true },
  { id: "14f66cdb", look: "blush-net-bridal", shot: "model" },
  { id: "1c7c42b6", look: "red-velvet-bridal", shot: "detail" },
  { id: "21baac63", look: "maroon-gharara", shot: "full" },
  { id: "227ab51e", look: "gold-tissue", shot: "rack" },
  { id: "2a1d6ecf", look: "royal-blue-silk", shot: "full", screen: true },
  { id: "2bbb2b80", look: "royal-blue-silk", shot: "full", screen: true },
  { id: "2f2b0e18", look: "red-velvet-bridal", shot: "detail" },
  { id: "32b1efeb", look: "navy-kameez", shot: "detail", screen: true, trimBottom: 0.09 },
  { id: "334ff912", look: "gold-tissue", shot: "rack" },
  { id: "3563edfd", look: "red-velvet-bridal", shot: "detail" },
  { id: "43781497", look: "pink-lehenga", shot: "model" },
  { id: "489c01b6", look: "red-velvet-bridal", shot: "full" },
  { id: "4a684780", look: "pink-lehenga", shot: "model" },
  { id: "50cadec0", look: "pink-lehenga", shot: "model" },
  { id: "5451df09", look: "gold-tissue", shot: "full" },
  { id: "57816702", look: "royal-blue-silk", shot: "full", screen: true },
  { id: "6647c33a", look: "maroon-gharara", shot: "full" },
  { id: "6c17dfaf", look: "pink-lehenga", shot: "detail" },
  { id: "6cad7095", look: "red-velvet-bridal", shot: "full" },
  { id: "7009df62", look: "red-velvet-bridal", shot: "full" },
  { id: "7b607a63", look: "mehndi-lehenga", shot: "full" },
  { id: "7b6a84c8", look: "royal-blue-silk", shot: "full", screen: true },
  { id: "878f984e", look: "red-velvet-bridal", shot: "full" },
  { id: "8bdf63fd", look: "silver-tissue-pair", shot: "full" },
  { id: "96024be0", look: "gold-tissue", shot: "full" },
  { id: "99d515ce", look: "festive-rack", shot: "rack" },
  { id: "a841c54e", look: "teal-silk", shot: "full", screen: true },
  { id: "b1cb4c44", look: "red-velvet-bridal", shot: "detail" },
  { id: "c10fe6e1", look: "gold-tissue", shot: "full" },
  { id: "d0995380", look: "royal-blue-silk", shot: "full", screen: true },
  { id: "d0f83124", look: "blush-net-bridal", shot: "model" },
  { id: "f07534b1", look: "pink-lehenga", shot: "model" },
  { id: "f2270765", look: "mehndi-lehenga", shot: "full" },
  { id: "f55472d6", look: "teal-silk", shot: "full", screen: true },
  { id: "fac8c992", look: "royal-blue-silk", shot: "full", screen: true },
];

/** Assets that get a generated preview clip (see scripts/generate-videos.sh). */
export const VIDEO_ASSETS = [
  "5451df09",
  "1c7c42b6",
  "4a684780",
  "7b607a63",
  "6647c33a",
  "2a1d6ecf",
  "99d515ce",
  "8bdf63fd",
] as const;
