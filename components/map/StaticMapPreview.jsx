import Link from "next/link";
import Image from "next/image";
import { getGeoapifyStaticMapUrl } from "@/lib/geoapify";

export default function StaticMapPreview({
  lat,
  lng,
  title,
  location,
  category = "Issue",
  interactiveHref = "/map",
}) {
  if (!lat || !lng) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
        📍 No GPS coordinates recorded for this report.
      </div>
    );
  }

  const staticUrl = getGeoapifyStaticMapUrl({
    lat,
    lng,
    zoom: 15,
    width: 600,
    height: 280,
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden group">
        <Image
          src={staticUrl}
          alt={`Map preview of ${location || title || category}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-3 z-10">
          <div className="text-white">
            <p className="text-xs font-semibold leading-tight drop-shadow-sm">{location}</p>
            <p className="text-[10px] text-slate-200 font-mono mt-0.5 drop-shadow-sm">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 flex items-center justify-between gap-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500 text-[11px] flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Geoapify Maps
        </span>
        <div className="flex gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Google Maps ↗
          </a>
          <span className="text-slate-300">•</span>
          <Link
            href={interactiveHref}
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Open in City Map →
          </Link>
        </div>
      </div>
    </div>
  );
}
