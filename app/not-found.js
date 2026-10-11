import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata = { title: "Page Not Found" };

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="text-7xl font-black text-slate-200 select-none">404</span>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="primary">← Back to Home</Button>
      </Link>
    </div>
  );
}
