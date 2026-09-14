import Link from "next/link";
import { CATEGORIES } from "@/data/categories";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-hairline bg-sand/60 pb-20 lg:pb-0">
      <div className="container-wide grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl uppercase tracking-[0.2em]">Sadaf Boutique</p>
          <p className="mt-3 max-w-xs text-sm text-muted">Bridal and luxury formal wear, hand-embellished in our Lahore atelier. Orders by WhatsApp, delivery across Pakistan and worldwide.</p>
        </div>
        <FooterList title="Shop" items={CATEGORIES.map((c) => ({ href: `/category/${c.slug}`, label: c.label }))} />
        <FooterList
          title="Help"
          items={[
            { href: "/shop", label: "Size guide" },
            { href: "/shop", label: "Shipping & returns" },
            { href: "/shop", label: "Care instructions" },
            { href: "/shop", label: "Contact" },
          ]}
        />
        <div>
          <p className="eyebrow mb-4">Visit</p>
          <p className="text-sm leading-relaxed text-muted">
            Sadaf Boutique
            <br />
            DHA Phase 5, Lahore
            <br />
            Mon – Sat, 11am – 9pm
          </p>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="container-wide flex flex-col gap-2 py-4 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Sadaf Boutique. All rights reserved.</span>
          <span>Prices in Pakistani Rupees (PKR).</span>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            <Link href={i.href} className="text-sm transition-colors hover:text-gold">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
