"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

/** One-hand bottom navigation for phones: Home | Shop | Search | Wishlist | Cart. */
export function MobileNavigation() {
  const pathname = usePathname();
  const { openSearch, openCart } = useUI();
  const { count } = useCart();
  const { ids } = useWishlist();

  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-muted transition-colors";
  const active = "text-ink";

  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ivory/95 pb-safe backdrop-blur-sm lg:hidden">
      <div className="flex h-14 items-stretch">
        <Link href="/" className={cn(item, pathname === "/" && active)}>
          <Home size={20} strokeWidth={1.5} />
          Home
        </Link>
        <Link href="/shop" className={cn(item, pathname.startsWith("/shop") || pathname.startsWith("/category") ? active : "")}>
          <LayoutGrid size={20} strokeWidth={1.5} />
          Shop
        </Link>
        <button type="button" onClick={openSearch} className={item}>
          <Search size={20} strokeWidth={1.5} />
          Search
        </button>
        <Link href="/wishlist" className={cn(item, "relative", pathname === "/wishlist" && active)}>
          <span className="relative">
            <Heart size={20} strokeWidth={1.5} />
            {ids.length ? <Badge n={ids.length} /> : null}
          </span>
          Wishlist
        </Link>
        <button type="button" onClick={openCart} className={item}>
          <span className="relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count ? <Badge n={count} /> : null}
          </span>
          Cart
        </button>
      </div>
    </nav>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-semibold leading-none text-ivory">
      {n > 99 ? "99+" : n}
    </span>
  );
}
