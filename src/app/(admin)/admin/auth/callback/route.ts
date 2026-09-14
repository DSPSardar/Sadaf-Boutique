import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/** Completes a magic-link sign-in: exchanges the code for a session cookie, then lands on /admin. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  if (code) {
    const supabase = await getServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
}
