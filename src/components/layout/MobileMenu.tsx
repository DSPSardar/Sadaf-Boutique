"use client";

import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { useUI } from "@/store/ui";
import { Drawer } from "@/components/ui/Drawer";

export function MobileMenu() {
  const { menuOpen, closeMenu } = useUI();
  const link = "block py-3 text-[15px] transition-colors hover:text-gold";
  return (
    <Drawer open={menuOpen} onClose={closeMenu} title="Menu">
      <nav aria-label="Mobile menu" className="px-5 py-3" onClick={closeMenu}>
        <Link href="/shop" className={link}>Shop all</Link>
        <Link href="/shop?new=1" className={link}>New Arrivals</Link>
        <Link href="/shop?sale=1" className={link}>Sale</Link>
        <p className="eyebrow mt-5 mb-1">Categories</p>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className={link}>
            {c.label}
          </Link>
        ))}
        <p className="eyebrow mt-5 mb-1">Account</p>
        <Link href="/wishlist" className={link}>Wishlist</Link>
      </nav>
    </Drawer>
  );
}
