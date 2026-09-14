import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Sadaf Boutique — Bridal & Luxury Formals", template: "%s · Sadaf Boutique" },
  description: "Hand-embellished bridal wear and luxury formals from Lahore. Velvet, tissue and net ensembles with zardozi work. Order on WhatsApp.",
  openGraph: { siteName: "Sadaf Boutique", type: "website", images: ["/products/5451df09/card-800.webp"] },
};

export const viewport: Viewport = { themeColor: "#f7f4ef", width: "device-width", initialScale: 1 };

/** Root layout: fonts and global styles only. Storefront chrome lives in (store)/layout.tsx, the admin shell in (admin)/. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
