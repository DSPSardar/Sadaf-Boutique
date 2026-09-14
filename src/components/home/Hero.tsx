import Link from "next/link";
import { blurDataURL, cardSrc, cardSrcSet } from "@/lib/images";
import { Button } from "@/components/ui/Button";

const HERO_ASSETS = [
  { id: "5451df09", alt: "Champagne tissue bridal set on a rack" },
  { id: "1c7c42b6", alt: "Red velvet bridal with gold zardozi neckline" },
  { id: "4a684780", alt: "Model wearing a rose pink embellished lehenga choli" },
];

/** Compact editorial banner — the catalogue starts immediately beneath it. */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="container-wide pt-3 sm:pt-4">
      <div className="grid overflow-hidden rounded-xs bg-sand lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="relative order-2 flex flex-col justify-center px-5 py-5 lg:order-1 lg:px-10 lg:py-10">
          <p className="eyebrow">Autumn / Winter 2026</p>
          <h1 id="hero-heading" className="mt-2 font-display text-3xl leading-[1.05] font-medium uppercase tracking-[0.12em] sm:text-4xl lg:text-[44px]">
            Sadaf Boutique
          </h1>
          <p className="mt-1 font-display text-2xl italic text-muted sm:text-3xl">New Collection</p>
          <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-muted sm:block">Hand-embellished bridal and luxury formals — velvet, tissue and net, finished with zardozi in our Lahore atelier.</p>
          <div className="mt-4 flex items-center gap-3 sm:mt-5">
            <Link href="/shop?new=1">
              <Button size="lg">Shop now</Button>
            </Link>
            <Link href="/category/bridal" className="text-[12px] font-medium uppercase tracking-[0.16em] underline-offset-4 hover:underline">
              Bridal edit
            </Link>
          </div>
        </div>
        <div className="order-1 grid grid-cols-3 gap-0.5 lg:order-2">
          {HERO_ASSETS.map((a, i) => (
            <div key={a.id} className={i === 2 ? "hidden sm:block" : ""}>
              <div className="relative aspect-[4/5] max-h-[200px] w-full overflow-hidden sm:max-h-[300px] lg:max-h-[380px]" style={{ backgroundImage: `url(${blurDataURL(a.id)})`, backgroundSize: "cover" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cardSrc(a.id, 600)}
                  srcSet={cardSrcSet(a.id)}
                  sizes="(min-width: 1024px) 20vw, 33vw"
                  alt={a.alt}
                  width={600}
                  height={750}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
