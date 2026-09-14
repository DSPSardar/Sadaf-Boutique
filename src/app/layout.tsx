import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProviders } from "@/store/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { FloatingWhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-manrope", display: "swap" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Sadaf Boutique — Bridal & Luxury Formals", template: "%s · Sadaf Boutique" },
  description: "Hand-embellished bridal wear and luxury formals from Lahore. Velvet, tissue and net ensembles with zardozi work. Order on WhatsApp.",
  openGraph: { siteName: "Sadaf Boutique", type: "website", images: ["/products/5451df09/card-800.webp"] },
};

export const viewport: Viewport = { themeColor: "#f7f4ef", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-dvh pb-14 lg:pb-0">
        <AppProviders>
          <Suspense fallback={<div className="h-14 lg:h-16" />}>
            <Header />
          </Suspense>
          <main>{children}</main>
          <Footer />
          <Suspense>
            <MobileNavigation />
          </Suspense>
          <MobileMenu />
          <SearchOverlay />
          <CartDrawer />
          <ProductQuickView />
          <FloatingWhatsAppButton />
        </AppProviders>
      </body>
    </html>
  );
}
