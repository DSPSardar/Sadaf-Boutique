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

## Backend: Supabase + admin panel

The storefront reads from Supabase when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
are set, and falls back to the built-in mock catalogue when they are not (design reviews, CI).

### One-time setup

1. Create a project at supabase.com (nearest region). In Project Settings → API copy the URL, the
   anon/publishable key and the service-role key into `.env.local`.
2. Under Authentication → Users, add the owner (email + password). Put the same email in `ADMIN_EMAILS`.
3. Apply the schema and policies, then seed:

```bash
npx supabase login                       # opens the browser once
npx supabase link --project-ref <ref>    # ref is in the project URL
npx supabase db push                     # runs supabase/migrations/*
psql "$DATABASE_URL" -f supabase/seed.sql            # base categories
node scripts/seed-supabase.mjs           # optional: load the 120 demo products + media into Storage
```

   Then allow-list the admin email (run once in the SQL editor or psql):

```sql
insert into admin_invites (email) values ('owner@example.com');
insert into admins (user_id, email) select id, email from auth.users where email = 'owner@example.com' on conflict do nothing;
```

4. `npm run dev` and open http://localhost:3000/admin.

### How it fits together

| Piece | Where |
| --- | --- |
| Schema, RLS, storage bucket + policies | `supabase/migrations/` |
| Supabase clients (browser, cookie-bound server, anon public, service role) | `src/lib/supabase/` |
| DB → `Product` mapping, public catalogue reads (cached, tag `catalog`) | `src/lib/catalog-supabase.ts`, `src/lib/catalog-source.ts` |
| Session refresh + `/admin` gate | `src/proxy.ts` |
| Admin allow-list check | `src/lib/admin/auth.ts` (`requireAdmin`) |
| Admin pages, server actions | `src/app/(admin)/admin/` |
| Photo renditions on upload (sharp) + Storage upload | `src/app/api/admin/media/route.ts`, `src/lib/admin/renditions.ts` |
| Admin UI (product form, media manager, categories, login) | `src/components/admin/` |

Every admin save calls `revalidateTag("catalog")`, so the storefront (ISR, 60 s) updates immediately.
Only products with status **Live** are visible on the storefront; drafts and archived products are
admin-only, enforced by row-level security as well as the queries.

## Connecting the rest later

- **Orders / checkout:** add an `orders` table and a checkout server action; the cart store in
  `src/store/cart.tsx` already exposes resolved lines and a subtotal.
- **Customer accounts:** Supabase Auth is in place for admins; a `customers` policy set and a
  profile page would extend it. Wishlist/cart sync would replace the localStorage persistence.
- **Payments / WhatsApp automation:** `src/lib/whatsapp.ts` builds the message today; swap
  `buildWhatsAppUrl` for a call to your ordering service or payment gateway.
