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
  liPostUrl,
  liError,
  isLiRetrying,
  onLiRetry,
}) {
  const config = PLATFORM_CONFIG[name];
  if (!config) return null;

  const postUrl = name === "LinkedIn" ? liPostUrl : wpPostUrl;
  const error = name === "LinkedIn" ? liError : wpError;
  const retrying = name === "LinkedIn" ? isLiRetrying : isRetrying;
  const handleRetry = name === "LinkedIn" ? onLiRetry : onRetry;

  return (
    <div className="flex items-center justify-between gap-3 w-full group py-0.5">
      <div className="flex items-center gap-2.5">
        <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-xs border border-gray-100 transition-all group-hover:shadow-md shrink-0">
          <Image src={config.iconSrc} alt={config.iconAlt} width={20} height={20} className="object-contain" />
        </div>
        <span className="text-sm font-semibold text-brand-black">{name}</span>
      </div>

      <div className="flex items-center gap-2">
        {(name === "WordPress" || name === "LinkedIn") && retrying && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Syncing...
          </span>
        )}

        {(name === "WordPress" || name === "LinkedIn") && !retrying && postUrl && (
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100 transition-all hover:bg-emerald-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live ↗
          </a>
        )}

        {(name === "WordPress" || name === "LinkedIn") && !retrying && !postUrl && error && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 border border-red-100">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Failed
            </span>
            {handleRetry && (
              <button
                onClick={handleRetry}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {(name === "WordPress" || name === "LinkedIn") && !retrying && !postUrl && !error && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        )}

        {name === "Easy Blogger" && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        )}
      </div>
    </div>
  );
}
