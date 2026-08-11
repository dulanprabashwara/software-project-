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
    <div className="flex items-center justify-between gap-3 w-full group py-0.5">
      <div className="flex items-center gap-2.5">
        <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-xs border border-gray-100 transition-all group-hover:shadow-md shrink-0">
          <Image src={config.iconSrc} alt={config.iconAlt} width={20} height={20} className="object-contain" />
        </div>
        <span className="text-sm font-semibold text-gray-800">{name}</span>
      </div>

      <div className="flex items-center gap-2">
        {name === "WordPress" && isRetrying && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Syncing...
          </span>
        )}

        {name === "WordPress" && !isRetrying && wpPostUrl && (
          <a
            href={wpPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100 transition-all hover:bg-emerald-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live ↗
          </a>
        )}

        {name === "WordPress" && !isRetrying && !wpPostUrl && wpError && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 border border-red-100">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Failed
            </span>
            <button 
              onClick={onRetry} 
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {name === "Easy Blogger" && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        )}

        {name === "LinkedIn" && (
          <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600 border border-sky-100">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Scheduled
          </span>
        )}
      </div>
    </div>
  );
}