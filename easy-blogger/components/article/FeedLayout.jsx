"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RightFeed from "./RightFeed";

export default function FeedLayout({ title, tabs = [], children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full overflow-hidden mx-auto">
      {/* Left Main Section */}
      <div className="h-full flex flex-col flex-1 min-w-0">
        {/* Header + Tabs */}
        <div className="p-3 border-b border-[#e5e7eb] px-8">
          <h1 className="text-4xl font-bold font-[Georgia]">{title}</h1>

          {/* Section links map */}
          <div className="flex gap-10">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3 font-semibold ${
                  pathname === tab.href
                    ? "text-black underline underline-offset-8"
                    : "text-gray-500 hover:text-black transition-colors"
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Page content injected here */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Rightfeed */}
      <aside className="hidden lg:block w-80 overflow-y-auto ml-auto">
        <RightFeed />
      </aside>
    </div>
  );
}
