"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/cn";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { IconButton } from "@/components/ui/IconButton";
import { useHydrated } from "@/hooks/useHydrated";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?new=1", label: "New Arrivals" },
  { href: "/shop?sale=1", label: "Sale" },
];

/** Compact sticky header: wordmark, primary nav with a categories dropdown, and utility icons. */
export function Header() {
  const pathname = usePathname();
  const { openSearch, openCart, openMenu } = useUI();
  const { count } = useCart();
  const { ids } = useWishlist();
  // Badges come from localStorage; render them only after this boundary has hydrated.
  const hydrated = useHydrated();
  const wishlistBadge = hydrated ? ids.length : 0;
  const cartBadge = hydrated ? count : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ivory/95 backdrop-blur-sm">
      <div className="container-wide flex h-14 items-center justify-between gap-4 lg:h-16">
        <div className="flex items-center gap-1 lg:hidden">
          <IconButton label="Open menu" onClick={openMenu}>
            <Menu size={22} strokeWidth={1.5} />
          </IconButton>
        </div>

        <Link href="/" className="whitespace-nowrap font-display text-[17px] font-medium uppercase tracking-[0.14em] sm:text-[22px] sm:tracking-[0.22em] lg:text-2xl" aria-label="Sadaf Boutique home">
          Sadaf <span className="font-light">Boutique</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[12px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-gold",
                pathname === item.href.split("?")[0] && item.href === "/shop" && "text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="group relative">
            <button type="button" className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-gold" aria-haspopup="true">
              Categories <ChevronDown size={14} strokeWidth={1.5} />
            </button>
            <div className="invisible absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="rounded-xs border border-hairline bg-surface py-2 shadow-lift">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className="block px-4 py-2 text-[13px] transition-colors hover:bg-sand">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-0.5">
          <IconButton label="Search" onClick={openSearch}>
            <Search size={20} strokeWidth={1.5} />
          </IconButton>
          <Link href="/wishlist" className="hidden lg:block">
            <IconButton label="Wishlist" badge={wishlistBadge} tabIndex={-1}>
              <Heart size={20} strokeWidth={1.5} />
            </IconButton>
          </Link>
          <IconButton label="Cart" badge={cartBadge} onClick={openCart}>
            <ShoppingBag size={20} strokeWidth={1.5} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
