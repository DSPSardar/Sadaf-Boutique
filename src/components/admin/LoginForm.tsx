"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Field, inputClass } from "@/components/admin/Field";
import { Button } from "@/components/ui/Button";

type Mode = "link" | "password";

/** Owner sign-in: magic link by default (no password to manage), password as an alternative. */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("link");
  const [error, setError] = useState<string | null>(
    params.get("denied") ? "That account is not on the admin list." : params.get("error") === "link" ? "That sign-in link is invalid or has expired. Request a new one." : null
  );
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const supabase = getBrowserSupabase();

    if (mode === "link") {
      const next = params.get("next") ?? "/admin";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        // Invited admins (admin_invites) are created on first sign-in; the DB trigger then grants access.
        // Anyone else gets an auth user but no admin row, so requireAdmin still denies them.
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(next)}` },
      });
      setBusy(false);
      if (error) setError(error.message);
      else setSent(email);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: String(form.get("password")) });
    setBusy(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Email or password is incorrect." : error.message);
      return;
    }
    router.replace(params.get("next") ?? "/admin");
    router.refresh();
  }

  if (sent) {
    return (
      <div role="status" className="space-y-3 text-sm">
        <p className="font-medium">Check your inbox</p>
        <p className="text-muted">
          We sent a sign-in link to <span className="text-ink">{sent}</span>. Open it on this device to enter the admin panel. The link expires in an hour.
        </p>
        <button type="button" onClick={() => setSent(null)} className="text-[12px] underline underline-offset-4">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xs bg-oxblood/10 px-3 py-2 text-[12px] text-oxblood">
          {error}
        </p>
      ) : null}
      <Field label="Email" name="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      {mode === "password" ? (
        <Field label="Password" name="password">
          <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </Field>
      ) : null}
      <Button type="submit" block disabled={busy}>
        {busy ? "Please wait…" : mode === "link" ? "Email me a sign-in link" : "Sign in"}
      </Button>
      <button type="button" onClick={() => setMode(mode === "link" ? "password" : "link")} className="block w-full text-center text-[12px] text-muted underline-offset-4 hover:underline">
        {mode === "link" ? "Sign in with a password instead" : "Email me a sign-in link instead"}
      </button>
    </form>
  );
}
