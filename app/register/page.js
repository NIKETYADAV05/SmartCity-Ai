"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/** Map Supabase registration errors to friendly UI strings. */
function friendlyError(message) {
  if (!message) return "An unexpected error occurred. Please try again.";
  const m = message.toLowerCase();
  if (m.includes("user already registered") || m.includes("already been registered") || m.includes("email address is already"))
    return "An account with this email already exists. Please sign in instead.";
  if (m.includes("password should be at least") || m.includes("weak password"))
    return "Password must be at least 6 characters long.";
  if (m.includes("invalid email") || m.includes("unable to validate email"))
    return "Please enter a valid email address.";
  if (m.includes("signup is disabled"))
    return "New registrations are temporarily disabled. Please try again later.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Please check your connection and try again.";
  return message;
}

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [password,  setPassword]  = useState("");
  const [terms,     setTerms]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!firstName.trim()) { setError("First name is required.");          return; }
    if (!lastName.trim())  { setError("Last name is required.");           return; }
    if (!email.trim())     { setError("Email address is required.");       return; }
    if (!password)         { setError("Password is required.");            return; }
    if (password.length < 6) { setError("Password must be at least 6 characters long."); return; }
    if (!terms)            { setError("You must agree to the Terms of Service."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const { error: signUpError } = await supabase.auth.signUp({
        email:    email.trim(),
        password,
        options: {
          data: {
            // These fields are passed to the DB trigger that creates the
            // public.profiles row. The trigger reads raw_user_meta_data.
            full_name: fullName,
            name:      fullName,
            phone:     phone.trim() || null,
          },
        },
      });

      if (signUpError) {
        setError(friendlyError(signUpError.message));
        return;
      }

      // Supabase sends a confirmation email. Show success state.
      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success state — preserve card layout ──────────────────────────────────
  if (success) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center py-12 px-4">
          <div className="w-full max-w-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-500 mx-auto mb-4">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <h2 className="text-lg font-bold text-slate-800">Check your email</h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                We&apos;ve sent a confirmation link to <strong>{email}</strong>.<br />
                Click the link to activate your account, then sign in.
              </p>
              <Link
                href="/login"
                className="mt-6 block w-full text-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Header — unchanged */}
            <div className="text-center mb-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mx-auto">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21V11m0 0h8m-8 0V7m8 4v10M8 7h8"/>
                </svg>
              </span>
              <h1 className="mt-3 text-xl font-bold text-slate-900">Create your account</h1>
              <p className="mt-1 text-xs text-slate-500">Join SmartCity AI as a citizen</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700" role="alert">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* First + Last name — unchanged layout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700" htmlFor="first">First name</label>
                  <input
                    id="first"
                    type="text"
                    placeholder="Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    autoComplete="given-name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700" htmlFor="last">Last name</label>
                  <input
                    id="last"
                    type="text"
                    placeholder="Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    autoComplete="family-name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700" htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
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
                <label className="text-xs font-medium text-slate-700" htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  autoComplete="tel"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-slate-300"
                  id="terms"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="terms">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </label>
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
                    Creating account…
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
