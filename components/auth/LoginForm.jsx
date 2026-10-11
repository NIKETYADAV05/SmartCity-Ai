"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/** Map Supabase error messages to friendly UI strings. */
function friendlyError(message) {
  if (!message) return "An unexpected error occurred. Please try again.";
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Incorrect email or password. Please try again.";
  if (m.includes("email not confirmed"))
    return "Please verify your email address before signing in. Check your inbox.";
  if (m.includes("too many requests"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Please check your connection and try again.";
  return message;
}

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const nextPath     = searchParams.get("next") || null;

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim())    { setError("Email address is required."); return; }
    if (!password)        { setError("Password is required.");      return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(friendlyError(authError.message));
        return;
      }

      // Determine role for post-login redirect.
      const userId = data.user?.id;
      let dest = "/citizen/dashboard";

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profile?.role === "admin") dest = "/admin";
      }

      router.push(nextPath ?? dest);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 text-slate-600">
            <input type="checkbox" className="rounded border-slate-300" />
            Remember me
          </label>
          <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Signing in…
            </>
          ) : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">Create one</Link>
      </p>

      {/* Official Admin Portal Gateway */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500 mb-2">
          Municipal official or city administrator?
        </p>
        <Link
          href="/admin-login"
          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-700 transition-colors shadow-2xs"
        >
          <span>🛡️</span>
          <span>Official Administration Portal Login →</span>
        </Link>
      </div>
    </>
  );
}
