/**
 * LoadingState.jsx — Skeleton/spinner placeholder.
 */
import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return (
    <svg className={cn("animate-spin h-6 w-6 text-blue-500", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

export function SkeletonLine({ className }) {
  return <div className={cn("h-4 rounded bg-slate-200 animate-pulse", className)} />;
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 space-y-3", className)}>
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-2/3" />
      <SkeletonLine className="w-1/2" />
    </div>
  );
}

export default function LoadingState({ message = "Loading…", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-20", className)}>
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
