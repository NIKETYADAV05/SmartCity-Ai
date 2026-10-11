import { Suspense } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign In" };

function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 rounded-lg bg-slate-100" />
      <div className="h-9 rounded-lg bg-slate-100" />
      <div className="h-9 rounded-lg bg-blue-100" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Logo + heading — preserved exactly */}
            <div className="text-center mb-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mx-auto">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21V11m0 0h8m-8 0V7m8 4v10M8 7h8"/>
                </svg>
              </span>
              <h1 className="mt-3 text-xl font-bold text-slate-900">Sign in to SmartCity AI</h1>
              <p className="mt-1 text-xs text-slate-500">Enter your credentials to continue</p>
            </div>

            {/* LoginForm reads useSearchParams — must be in Suspense */}
            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
