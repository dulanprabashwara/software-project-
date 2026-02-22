"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Sparkles,
  MessageCircle,
  Search,
  PenSquare,
  Bell,
  Menu,
  LogOut,
  BadgeCheck,
} from "lucide-react";

import { useSubscription } from "../../app/subscription/SubscriptionContext";
import { useAuth } from "../../app/context/AuthContext"; // ✅ same idea as code 2

export default function Header({ onToggleSidebar }) {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { user, logout } = useAuth(); // ✅ get real user + logout from backend/auth

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);

  // ✅ mount fix (code 1 had mounted state but never set it)
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ derive user display values (same concept as code 2)
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const avatarUrl =
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=1ABC9C&color=fff`;

  // Close dropdown when clicking outside (only when open)
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const membership = isPremium
    ? { label: "Manage Membership", href: "/subscription/manage" }
    : { label: "Become a Member", href: "/subscription/upgrade" };

  // ✅ real sign out like code 2
  const handleSignOut = async () => {
    try {
      setOpen(false);
      await logout();
      router.push("/"); // or "/login" if that's your flow
    } catch (err) {
      console.error("Logout failed:", err);
      // keep UI same—no alerts unless you want one
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white border-b border-[#e5e7eb] px-6 flex items-center justify-between">
      {/* Left stuff (logo, sidebar button)*/}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <Link href="/home" className="flex items-center gap-2">
          <img
            src="/images/easy-blogger-logo.png"
            alt="Easy Blogger Logo"
            className="h-12 w-auto"
          />
          <h1 className="text-2xl font-bold text-[#1ABC9C] font-serif">
            Easy Blogger
          </h1>
        </Link>
      </div>

      {/* Search (md+) */}
      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          placeholder="Search..."
          className="w-full pl-11 pr-4 py-2 bg-gray-50  border border-[#e5e7eb] rounded-full text-sm outline-none focus:ring-1 ring-[#1ABC9C]"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Link
          href="/write/choose-method"
          className="bg-[#1ABC9C] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#17a589]"
        >
          <PenSquare size={16} />
          <span className="hidden sm:inline">Write</span>
        </Link>

        <button
          className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full"
          aria-label="Notifications"
        >
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <div>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-full border-2 overflow-hidden ${
                isPremium ? "border-amber-400" : "border-transparent"
              }`}
              aria-label="User menu"
            >
              <img
                src={avatarUrl}
                alt="User"
                className="w-full h-full object-cover"
              />
            </button>

            {isPremium && (
              <div className="absolute -bottom-1 -right-1 drop-shadow-md z-10">
                <BadgeCheck className="w-5 h-5 text-[#1ABC9C]" />
              </div>
            )}
          </div>

          {/* optional: keep dropdown hidden until mounted to avoid hydration weirdness */}
          {mounted && open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100">
              <div
                className={`w-17 h-17 rounded-full border-2 overflow-hidden mx-auto ${
                  isPremium ? "border-amber-400" : "border-transparent"
                }`}
              >
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="px-4 py-2 border-none mb-1 text-sm mb-0">
                <p className="font-bold">
                  <Link href="./profile" className="flex items-center justify-between">
                    <span className="truncate">{displayName}</span>

                    {isPremium && (
                      <BadgeCheck className="w-5 h-5 text-[#1ABC9C] flex-shrink-0 ml-2" />
                    )}
                  </Link>
                </p>

                <p className="text-gray-500 text-xs truncate">{displayEmail}</p>
              </div>

              <div className="border-t border-[#e5e7eb] my-1" />

              <Link
                href="#"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
              >
                <HelpCircle size={16} /> Help
              </Link>

              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
              >
                <MessageCircle size={16} /> Messages
              </Link>

              <Link
                href={membership.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-amber-600"
              >
                <Sparkles size={16} /> {membership.label}
              </Link>

              <div className="border-t border-[#e5e7eb] my-1" />

              {/* ✅ same UI look, but real signout */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-red-500"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}