"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/cn";
import { cardSrc } from "@/lib/images";

const ITEMS = [
  { href: "/shop?new=1", label: "New Arrivals", assetId: "4a684780", match: (p: string, s: URLSearchParams) => p === "/shop" && s.get("new") === "1" },
  ...CATEGORIES.map((c) => ({ href: `/category/${c.slug}`, label: c.label, assetId: c.coverAssetId, match: (p: string) => p === `/category/${c.slug}` })),
  { href: "/shop?sale=1", label: "Sale", assetId: "7b607a63", match: (p: string, s: URLSearchParams) => p === "/shop" && s.get("sale") === "1" },
];

/** Horizontal, swipeable category rail with photo chips. */
export function CategoryNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <nav aria-label="Categories" className="container-wide mt-4 sm:mt-5">
      <ul className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 sm:-mx-5 sm:px-5 lg:-mx-6 lg:gap-5 lg:px-6">
        {ITEMS.map((item) => {
          const active = item.match(pathname, params);
          return (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} className="group flex flex-col items-center gap-1.5" aria-current={active ? "page" : undefined}>
                <span className={cn("block h-14 w-14 overflow-hidden rounded-full border-2 p-0.5 transition-colors sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px]", active ? "border-ink" : "border-transparent group-hover:border-hairline")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cardSrc(item.assetId, 400)} alt="" width={72} height={72} loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover" />
                </span>
                <span className={cn("whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.12em]", active ? "text-ink" : "text-muted group-hover:text-ink")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
