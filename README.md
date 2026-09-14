# Sadaf Boutique — storefront (frontend only)

A product-first boutique storefront for Sadaf Boutique's bridal and luxury formal wear.
Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. There is no
backend: the catalogue, cart, wishlist and WhatsApp ordering are all mock/UI-only, but every
data access goes through one seam so a real backend can be connected without rebuilding the UI.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WHATSAPP_NUMBER` (international format,
no `+`) and `NEXT_PUBLIC_SITE_URL`.

## What is here

| Area | Where |
| --- | --- |
| Home (compact hero, category rail, dense feed) | `src/app/page.tsx`, `src/components/home/*` |
| Shop with URL-synced filters and sorting | `src/app/shop/page.tsx`, `src/components/shop/*` |
| Category browsing | `src/app/category/[slug]/page.tsx` |
| Product detail (gallery, purchase panel, related) | `src/app/product/[slug]/page.tsx`, `src/components/product/*` |
| Quick view modal, search overlay, cart drawer, mobile menu | mounted once in `src/app/layout.tsx` |
| Wishlist page | `src/app/wishlist/page.tsx` |
| WhatsApp ordering (deep link with prefilled message) | `src/lib/whatsapp.ts`, `src/components/whatsapp/*` |
| Cart / wishlist / overlay state (localStorage persisted) | `src/store/*` |
| Mock catalogue (120 products from 37 real photos) | `src/data/*` |
| Data access seam | `src/lib/catalog.ts` (`CatalogSource`) |

## Product assets

Source photos live in `assets/source/` (not served). Scripts turn them into web assets:

```bash
npm run assets:sheet    # labelled contact sheet for tagging (assets/contact-sheet.jpg)
npm run assets:images   # responsive WebP renditions -> public/products/<id>/ + blur placeholders
npm run assets:videos   # short muted preview clips (ffmpeg) for the assets listed in VIDEO_ASSETS
npm run data:check      # catalogue sanity check (count, unique slugs, files exist)
```

Card renditions are 4:5 (400/600/800 px wide); very tall photos keep the full garment and get a
blurred fill instead of a crop. `large.webp` keeps the original aspect ratio for the gallery.
Hand-curated tags for each photo are in `src/data/assets.ts`.

The preview clips are generated from stills so the video UI (hover preview, play badge, gallery
playback) can be exercised. Replace them with real clips by dropping an `.mp4` at the same path.

## Connecting a backend later

- **Catalogue:** implement `CatalogSource` in `src/lib/catalog.ts` against your API/database and
  export it as `catalog`. Pages already call `catalog.getProducts()` / `getProductBySlug()`.
  `filterProducts`, `sortProducts`, `searchProducts` are pure helpers you can keep client-side or
  move server-side.
- **Images:** `src/lib/images.ts` is the only place that builds image URLs. Point it at your CDN
  and keep the same rendition names, or swap in `next/image` with a remote loader.
- **Cart / wishlist:** `src/store/cart.tsx` and `src/store/wishlist.tsx` expose
  `add / setQuantity / remove / toggle`. Replace the localStorage persistence with API calls.
- **WhatsApp automation:** `src/lib/whatsapp.ts` builds the message. Swap `buildWhatsAppUrl`
  for a call to your ordering service.
- **Accounts, payments, inventory, admin:** intentionally not built. Product types already carry
  `sku`, `stock` and `id` fields for inventory integration.
