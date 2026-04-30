"use client";

import Image from "next/image";

const PLATFORM_CONFIG = {
  "Easy Blogger": {
    iconSrc: "/icons/logo.jpeg",
    iconAlt: "Easy Blogger",
  },
  WordPress: {
    iconSrc: "/icons/wordpress.png",
    iconAlt: "WordPress",
  },
  LinkedIn: {
    iconSrc: "/icons/linkedin.png",
    iconAlt: "LinkedIn",
  },
};

export default function PlatformItem({
  name,
  wpPostUrl,
  wpError,
  isRetrying,
  onRetry,
}) {
  const config = PLATFORM_CONFIG[name];
  if (!config) return null;

  return (
    <div className="flex items-center justify-between gap-4 w-full group">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 transition-all group-hover:shadow-md">
          <Image src={config.iconSrc} alt={config.iconAlt} width={28} height={28} className="object-contain" />
        </div>
        <span className="text-lg font-semibold text-gray-800">{name}</span>
      </div>

      <div className="flex items-center gap-2">
        {name === "WordPress" && isRetrying && (
          <span className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-bold text-amber-600 border border-amber-100">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Syncing...
          </span>
        )}

        {name === "WordPress" && !isRetrying && wpPostUrl && (
          <a
            href={wpPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600 border border-emerald-100 transition-all hover:bg-emerald-100"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live ↗
          </a>
        )}

        {name === "WordPress" && !isRetrying && !wpPostUrl && wpError && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-bold text-red-600 border border-red-100">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Failed
            </span>
            <button 
              onClick={onRetry} 
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {name === "Easy Blogger" && (
          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600 border border-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live
          </span>
        )}
      </div>
    </div>
  );
}