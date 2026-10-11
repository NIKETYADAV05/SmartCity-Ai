"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function friendlyError(message) {
  if (!message) return "An unexpected error occurred. Please try again.";
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Incorrect municipal email or administrator password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your government email address.";
  return message;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@smartcity.gov");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdminSignIn(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Municipal administrative email is required.");
      return;
    }
    if (!password) {
      setError("Administrator password is required.");
      return;
    }

    setLoading(true);
    try {
      // 1. Try server-side admin authentication endpoint
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const resData = await res.json();

      if (res.ok && resData.success) {
        // Also sign in to Supabase in the background if possible
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        } catch {}

        router.push("/admin");
        router.refresh();
        return;
      }

      // If credentials rejected
      setError(friendlyError(resData.error || "Authentication failed."));
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleAdminSignIn} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Official Municipal Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartcity.gov"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Security Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? "Verifying Credentials…" : "Sign In to Administration →"}
        </button>
      </form>

      {/* Default credentials hint */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-[11px] text-slate-600 space-y-1">
        <p className="font-bold text-slate-700">Official Municipal Seed Credentials:</p>
        <p>• Email: <code className="font-mono text-indigo-700 font-bold">admin@smartcity.gov</code></p>
        <p>• Password: <code className="font-mono text-slate-700 font-bold">AdminPassword123!</code></p>
      </div>

      <div className="pt-2 text-center text-xs text-slate-400">
        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
          ← Switch to Citizen Login
        </Link>
      </div>
    </div>
  );
}
