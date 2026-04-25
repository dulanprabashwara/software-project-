"use client";
 
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Library,
  User,
  FileText,
  BarChart,
  Sparkles,
  Users,
  CreditCard,
  Plus,
  Loader2,
} from "lucide-react";
import { useSubscription } from "../../app/context/SubscriptionContext";
import { useAuth } from "../../app/context/AuthContext";
import { api } from "../../lib/api";
import { useState } from "react";

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleMembershipClick = async (e) => {
    if (!isPremium) return; // Let the link navigate normally to /subscription/upgrade
    
    e.preventDefault();
    if (!user) return;

    setPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await api.createStripePortalSession(token);
      const data = res.data || res;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
      alert("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  // list for links in the sidebar
  const links = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Library", href: "/library/saved", icon: Library },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Stories", href: "/stories/published", icon: FileText },
    { label: "Stats", href: "/stats", icon: BarChart },
    {
      label: "AI Generate",
      href: isPremium ? "/ai-generate" : "/subscription/upgrade",
      icon: Sparkles,
    },
    { label: "Following", href: "/profile?modal=following", icon: Users },
    {
      label: "Membership",
      href: isPremium ? "#" : "/subscription/upgrade",
      icon: CreditCard,
      onClick: handleMembershipClick,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#e5e7eb] duration-600 ease-in-out transition-transform z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <nav className="p-4 h-full flex flex-col">
        {/*  Main Links */}
        <div className="flex-1 space-y-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={link.onClick}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm ${pathname === link.href ? "bg-teal-50 text-teal-600" : "text-gray-500"}`}
            >
              {link.label === "Membership" && portalLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <link.icon size={20} />
              )}
              {link.label}
            </Link>
          ))}
        </div>

        {/*   Write Button*/}
        <Link
          href="/write/choose-method"
          className="mt-auto border-t border-[#e5e7eb] pt-4 flex items-center gap-3 text-gray-700"
        >
          <Plus
            size={24}
            className="bg-[#1ABC9C] text-white rounded-full p-1"
          />
          <span className="text-sm font-bold">Write Story</span>
        </Link>
      </nav>
    </aside>
  );
}
