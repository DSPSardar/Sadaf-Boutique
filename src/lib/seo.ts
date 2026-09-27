import { categoryLabel } from "@/data/categories";
import { cardSrc, largeSrc } from "@/lib/images";
import { SITE_URL } from "@/lib/site";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

/**
 * Structured data (schema.org JSON-LD) so Google, Bing and AI search engines can read the catalogue:
 * Product + Offer, ImageObject per photo, VideoObject for the product clip, BreadcrumbList, and the
 * store itself (LocalBusiness / ClothingStore). Rendered server-side in the page HTML.
 */

export const BRAND = "Sadaf Boutique";
export const STORE = {
  name: BRAND,
  url: SITE_URL,
  telephone: `+${WHATSAPP_NUMBER}`,
  address: { "@type": "PostalAddress", addressLocality: "Lahore", addressRegion: "Punjab", addressCountry: "PK", streetAddress: "DHA Phase 5" },
  openingHours: "Mo-Sa 11:00-21:00",
  description: "Hand-embellished bridal wear and luxury formals from Lahore. Velvet, tissue and net ensembles with zardozi work. Order on WhatsApp, delivery across Pakistan and worldwide.",
};

const abs = (path: string): string => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export function productUrl(p: Pick<Product, "slug">): string {
  return `${SITE_URL}/product/${p.slug}`;
}

/** Descriptive alt text: what the photo shows, for whom, and by whom — not just the product name. */
export function imageAlt(p: Pick<Product, "name" | "category">, index: number, existing?: string): string {
  const cat = categoryLabel(p.category);
  const base = `${p.name} – ${cat} by ${BRAND}, Lahore`;
  if (existing && existing.trim() && existing.trim() !== p.name) return existing;
  return index === 0 ? base : `${p.name} – detail view ${index + 1} (${cat}, ${BRAND})`;
}

export function videoTitle(p: Pick<Product, "name">): string {
  return `${p.name} – video | ${BRAND}`;
}

export function videoDescription(p: Pick<Product, "name" | "category" | "description">): string {
  return `Short video of the ${p.name} (${categoryLabel(p.category)}) from ${BRAND}, Lahore. ${p.description}`.slice(0, 500);
}

export function productImageUrls(p: Product): string[] {
  return p.images.map((img) => abs(largeSrc(img.assetId)));
}

export function productJsonLd(p: Product): Record<string, unknown>[] {
  const url = productUrl(p);
  const images = productImageUrls(p);
  const inStock = p.stock > 0;
  const hasPrice = p.price > 0;
  const cat = categoryLabel(p.category);

  const imageObjects = p.images.map((img, i) => ({
    "@type": "ImageObject",
    "@id": `${url}#image-${i + 1}`,
    contentUrl: abs(largeSrc(img.assetId)),
    thumbnailUrl: abs(cardSrc(img.assetId, 400)),
    name: imageAlt(p, i, img.alt),
    caption: imageAlt(p, i, img.alt),
    description: `${p.name} – ${cat} by ${BRAND}`,
    ...(img.width && img.height ? { width: img.width, height: img.height } : {}),
    representativeOfPage: i === 0,
    license: `${SITE_URL}/`,
    acquireLicensePage: `${SITE_URL}/`,
    creditText: BRAND,
    creator: { "@type": "Organization", name: BRAND },
    copyrightNotice: BRAND,
  }));

  const video = p.video
    ? {
        "@type": "VideoObject",
        "@id": `${url}#video`,
        name: videoTitle(p),
        description: videoDescription(p),
        thumbnailUrl: [abs(cardSrc(p.video.posterAssetId, 800))],
        contentUrl: abs(p.video.src),
        embedUrl: url,
        uploadDate: p.createdAt,
        duration: "PT12S",
        isFamilyFriendly: true,
        inLanguage: "en",
        publisher: { "@type": "Organization", name: BRAND, url: SITE_URL },
      }
    : undefined;

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.description,
    sku: p.sku,
    mpn: p.sku,
    url,
    image: images,
    brand: { "@type": "Brand", name: BRAND },
    category: cat,
    ...(p.details.fabric ? { material: p.details.fabric } : {}),
    ...(p.colors.length ? { color: p.colors.map((c) => c.name).join(", ") } : {}),
    ...(p.occasion.length ? { audience: { "@type": "PeopleAudience", suggestedGender: "female" }, keywords: [...p.occasion, ...p.tags].join(", ") } : { audience: { "@type": "PeopleAudience", suggestedGender: "female" } }),
    additionalProperty: [
      p.details.work ? { "@type": "PropertyValue", name: "Embellishment", value: p.details.work } : null,
      p.details.pieces.length ? { "@type": "PropertyValue", name: "Includes", value: p.details.pieces.join(", ") } : null,
      p.sizes.length ? { "@type": "PropertyValue", name: "Sizes", value: p.sizes.join(", ") } : null,
      { "@type": "PropertyValue", name: "Made in", value: "Lahore, Pakistan" },
    ].filter(Boolean),
    ...(video ? { video, subjectOf: { "@id": `${url}#video` } } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      ...(hasPrice ? { price: p.price } : { price: 0, description: "Price on request – message us on WhatsApp" }),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: BRAND },
      areaServed: ["PK", "Worldwide"],
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "PKR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
        },
      },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: cat, item: `${SITE_URL}/category/${p.category}` },
      { "@type": "ListItem", position: 3, name: p.name, item: url },
    ],
  };

  return [product, ...imageObjects.map((o) => ({ "@context": "https://schema.org", ...o })), breadcrumb];
}

export function storeJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "LocalBusiness", "Organization"],
    "@id": `${SITE_URL}/#store`,
    name: STORE.name,
    url: STORE.url,
    telephone: STORE.telephone,
    description: STORE.description,
    address: STORE.address,
    openingHours: STORE.openingHours,
    priceRange: "PKR 50,000 – 300,000",
    currenciesAccepted: "PKR",
    paymentAccepted: "Bank transfer, Cash on delivery",
    areaServed: ["Pakistan", "Worldwide"],
    contactPoint: { "@type": "ContactPoint", contactType: "sales", telephone: STORE.telephone, url: `https://wa.me/${WHATSAPP_NUMBER}`, availableLanguage: ["en", "ur"] },
    sameAs: [`https://wa.me/${WHATSAPP_NUMBER}`],
  };
}

export function categoryJsonLd(slug: string, label: string, description: string, products: Product[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/category/${slug}`,
    name: `${label} | ${BRAND}`,
    description,
    url: `${SITE_URL}/category/${slug}`,
    isPartOf: { "@id": `${SITE_URL}/#store` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: productUrl(p), name: p.name, image: abs(cardSrc(p.images[0].assetId, 800)) })),
    },
  };
}

/** Serialise for a <script type="application/ld+json">; escapes "<" so the JSON can't break out of the tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
