"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Browser client (anon key, session persisted in cookies). Used by the admin login form. */
export function getBrowserSupabase() {
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
