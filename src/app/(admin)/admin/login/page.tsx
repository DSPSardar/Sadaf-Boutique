import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function AdminLoginPage() {
  if (!hasSupabase()) return <NotConfigured />;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm rounded-xs border border-hairline bg-surface p-6 shadow-lift">
        <p className="font-display text-xl uppercase tracking-[0.2em]">Sadaf Boutique</p>
        <p className="eyebrow mt-1 mb-6">Admin sign in</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
