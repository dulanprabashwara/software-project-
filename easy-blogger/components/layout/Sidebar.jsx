// Left sidebar component for navigation and recommendations
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSubscription } from "../../app/subscription/SubscriptionContext";

export default function Sidebar({ isOpen = true, onOpenEngagement }) {
  const pathname = usePathname();
  const { isPremium } = useSubscription();

  const navItems = [
    { icon: "home", label: "Home", href: "/home" },
    { icon: "library", label: "Library", href: "/library" },
    { icon: "profile", label: "Profile", href: "/profile" },
    { icon: "stories", label: "Stories", href: "/stories" },
    { icon: "stats", label: "Stats", href: "/stats" },
    { icon: "ai", label: "AI Generate", href: "/ai-generate" },
    {
      icon: "following",
      label: "Following",
      href: "/profile/user_stats?tab=following",
    },
    {
      icon: "membership",
      label: "Membership",
      href: isPremium ? "/subscription/manage" : "/subscription/upgrade",
    },
  ];

  const isActive = (href) => {
    if (href === "/home") {
      return pathname === "/home";
    }

    // Special handling for Profile to verify it's the user's own profile
    if (href === "/profile") {
      // Exact match
      if (pathname === "/profile") return true;

      // Known own-profile sub-routes
      const ownProfileRoutes = [
        "/profile/edit",
        "/profile/user_stats",
        "/profile/normal",
        "/profile/premium",
      ];

      // If it starts with any of these, it's the user's own profile section
      return ownProfileRoutes.some((route) => pathname.startsWith(route));
    }

    return pathname.startsWith(href);
  };

  const getIcon = (type) => {
    switch (type) {
      case "home":
        // Filled house icon
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        );
      case "library":
        // Vertical lines like books
        return (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="4" y1="5" x2="4" y2="19" />
            <line x1="9" y1="5" x2="9" y2="19" />
            <line x1="14" y1="5" x2="14" y2="19" />
            <path d="M17 5l3 14" />
          </svg>
        );
      case "profile":
        // Person outline
        return (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
          </svg>
        );
      case "stories":
        // Document with lines
        return (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="12" y2="16" />
          </svg>
        );
      case "stats":
        // Bar chart - ascending
        return (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="6" y1="20" x2="6" y2="14" />
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="6" />
          </svg>
        );
      case "ai":
        // Sparkle/magic wand star
        return (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v2" />
            <path d="M12 19v2" />
            <path d="M3 12h2" />
            <path d="M19 12h2" />
            <path d="M5.6 5.6l1.4 1.4" />
            <path d="M17 17l1.4 1.4" />
            <path d="M17 7l1.4-1.4" />
            <path d="M5.6 18.4l1.4-1.4" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      case "following":
        // Two people
        return (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="7" r="3" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            <circle cx="17" cy="7" r="3" />
            <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
          </svg>
        );
      case "membership":
        // Card/membership icon
        return (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-[#E5E7EB] overflow-y-auto flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="py-6 px-4 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive(item.href)
                    ? "bg-[#E8F8F5] text-[#1ABC9C]"
                    : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
                }`}
              >
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Write Section */}
      <div className="px-4 pb-6">
        <Link
          href="/write/choose-method"
          className="w-full flex items-center gap-3 px-4 py-3 text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#1ABC9C] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="text-sm font-medium">Write</span>
        </Link>
      </div>
    </aside>
  );
}
