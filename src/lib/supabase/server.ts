import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/** Cookie-bound server client for server components, route handlers and server actions (respects RLS + the user's session). */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* called from a server component: cookies are refreshed by proxy.ts instead */
        }
      },
    },
  });
}

/** Anonymous client with no session — for public catalogue reads that may be cached/ISR'd (no cookies involved). */
export function getPublicSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Route every read through Next's data cache, tagged so admin mutations can call revalidateTag("catalog").
      fetch: (url, init) => fetch(url, { ...init, next: { tags: ["catalog"], revalidate: 60 } }),
    },
  });
}
