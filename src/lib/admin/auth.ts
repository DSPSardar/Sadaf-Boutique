import "server-only";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  email: string;
}

/** Returns the signed-in admin, or null when the user is anonymous or not on the allow-list. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? { userId: user.id, email: user.email } : null;
}

/** For server components and actions under /admin: redirects to the login page when not an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?denied=1");
  return session;
}
