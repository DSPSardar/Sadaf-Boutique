import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/", "/wishlist"] },
      // Let image/video crawlers fetch the media served from Supabase storage (external host, allowed by default).
      { userAgent: "Googlebot-Image", allow: "/" },
      { userAgent: "Googlebot-Video", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
