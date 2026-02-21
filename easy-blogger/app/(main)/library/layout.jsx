"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RightFeed from "../../../components/article/RightFeed";
import { DATA } from "../../../components/article/ArticleList";

export default function Layout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { name: "saved", href: "/library/saved" },
    { name: "reacted", href: "/library/reacted" },
    { name: "history", href: "/library/history" },
  ];

  return (
    <div className="flex h-full overflow-hidden mx-auto">
      
      {/* Left */}
      <div className="h-full flex flex-col flex-1 min-w-0">

        {/* Header + Tabs */}
        <div className="p-3 border-b border-[#e5e7eb] px-8">
          <h1 className="text-4xl font-bold">Library</h1>

          <div className="flex gap-10">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3 font-semibold ${
                  pathname === tab.href
                    ? "text-black underline underline-offset-8"
                    : "text-gray-500"
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

      {/* Right */}
      <aside className="hidden lg:block w-80 overflow-y-auto ml-auto">
        <RightFeed
          trending={DATA.trending}
          topics={DATA.topics}
          usersToFollow={DATA.usersToFollow}
        />
      </aside>

    </div>
  );
}
