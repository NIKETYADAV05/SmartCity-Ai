/**
 * ErrorState.jsx — Error boundary display component.
 */
import { cn } from "@/lib/utils";
import Button from "./Button";

export default function ErrorState({ title = "Something went wrong", description, onRetry, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-20 text-center", className)}>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">{description}</p>}
      </div>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
