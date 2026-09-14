import { Suspense } from "react";
import { AppProviders } from "@/store/providers";
import { catalog } from "@/lib/catalog-source";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { FloatingWhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

/** Storefront chrome. Catalogue pages regenerate at most every 60 s and on demand when an admin saves. */
export const revalidate = 60;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const products = await catalog.getProducts();
  return (
    <div className="min-h-dvh pb-14 lg:pb-0">
      <AppProviders products={products}>
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
    </div>
  );
}
