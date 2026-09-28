"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) throw new Error("The CMS has not been configured yet.");
      const supabase = createClient();
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      const { data: admin, error: roleError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", loginData.user.id)
        .maybeSingle();

      if (roleError) {
        await supabase.auth.signOut();
        throw new Error("The CMS database has not been initialized yet.");
      }
      if (!admin) {
        await supabase.auth.signOut();
        throw new Error("This account has not been approved as the portfolio admin.");
      }

      router.replace("/?admin=1");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 bg-background">
      <form onSubmit={login} className="w-full max-w-md rounded-2xl border border-border bg-card/40 p-8 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Portfolio CMS</p>
          <h1 className="font-display text-3xl">Admin login</h1>
          <p className="text-muted-foreground mt-2">Sign in with your Supabase admin account.</p>
        </div>
        <label className="block text-sm">
          Email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3" />
        </label>
        <label className="block text-sm">
          Password
          <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3" />
        </label>
        {(error || searchParams.get("error") === "not-authorized") && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
            {error || "This account is not authorized to manage the portfolio."}
          </p>
        )}
        <button disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">Back to portfolio</Link>
      </form>
    </main>
  );
}
