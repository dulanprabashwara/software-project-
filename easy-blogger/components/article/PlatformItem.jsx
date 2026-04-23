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
    <div className="flex items-center gap-2">
      <Image src={config.iconSrc} alt={config.iconAlt} width={22} height={22} />
      <span>{name}</span>

      {name === "WordPress" && isRetrying && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Retrying...
        </span>
      )}

      {name === "WordPress" && !isRetrying && wpPostUrl && (
        <a
          href={wpPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
        >
          Visit ↗
        </a>
      )}

      {name === "WordPress" && !isRetrying && !wpPostUrl && wpError && (
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
            Failed
          </span>
          <button onClick={onRetry} className="text-xs text-[#21c4a7] underline">
            Retry
          </button>
        </span>
      )}
    </div>
  );
}