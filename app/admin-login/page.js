import { Suspense } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

export const metadata = { title: "Municipal Administration Portal Login | SmartCity OS" };

function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 rounded-lg bg-slate-100" />
      <div className="h-9 rounded-lg bg-slate-100" />
      <div className="h-9 rounded-lg bg-indigo-100" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border-2 border-indigo-100 bg-white p-8 shadow-md">
            {/* Admin Header */}
            <div className="text-center mb-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white mx-auto shadow-sm">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l9 4v6c0 5-3.5 9.7-9 11C6.5 21.7 3 17 3 12V6l9-4z" />
                </svg>
              </span>
              <h1 className="mt-3 text-xl font-bold text-slate-900">Administration Portal</h1>
              <p className="mt-1 text-xs text-slate-500">Municipal Command & City Operations</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                🔒 Authorized Municipal Personnel Only
              </span>
            </div>

            <Suspense fallback={<FormSkeleton />}>
              <AdminLoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
