import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { catalog } from "@/lib/catalog-source";
import { cardSrc, largeSrc } from "@/lib/images";
import { productUrl, videoDescription, videoTitle } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const abs = (path: string): string => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/** sitemap.xml with image + video extensions so every product photo and clip is discoverable. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await catalog.getProducts();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...CATEGORIES.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: productUrl(p),
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
    images: p.images.map((img) => abs(largeSrc(img.assetId))),
    ...(p.video
      ? {
          videos: [
            {
              title: videoTitle(p),
              thumbnail_loc: abs(cardSrc(p.video.posterAssetId, 800)),
              description: videoDescription(p),
              content_loc: abs(p.video.src),
              player_loc: productUrl(p),
              duration: 12,
              publication_date: p.createdAt,
              family_friendly: "yes",
              requires_subscription: "no",
              live: "no",
            },
          ],
        }
      : {}),
  }));

  return [...staticPages, ...productPages];
}
