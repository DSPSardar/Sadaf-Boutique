import Link from "next/link";

/** Shown on /admin routes when the Supabase environment variables are missing. */
export function NotConfigured() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-lg rounded-xs border border-hairline bg-surface p-6">
        <p className="font-display text-xl uppercase tracking-[0.2em]">Sadaf Boutique</p>
        <h1 className="mt-4 font-display text-2xl">Admin is not connected yet</h1>
        <p className="mt-2 text-sm text-muted">
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>, apply the migrations in <code>supabase/</code>, then restart the dev server. See the README section “Backend: Supabase + admin panel”.
        </p>
        <p className="mt-4 text-sm">
          The storefront keeps running on the built-in demo catalogue meanwhile —{" "}
          <Link href="/" className="underline underline-offset-4">
            open it
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
