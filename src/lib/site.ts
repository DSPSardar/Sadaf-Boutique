/**
 * Public site origin used in metadata and WhatsApp messages.
 *
 * Order: NEXT_PUBLIC_SITE_URL → Vercel's auto-provided URL → localhost.
 * Blank values are ignored (a blank env var is NOT "unset" for `??` — that is what
 * broke the Vercel build with "Invalid URL"), and the result is validated so
 * `new URL()` never throws at build time.
 */
function normalize(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export const SITE_URL: string =
  normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalize(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
  normalize(process.env.NEXT_PUBLIC_VERCEL_URL) ??
  normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalize(process.env.VERCEL_URL) ??
  "http://localhost:3000";
