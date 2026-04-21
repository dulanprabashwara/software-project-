// components/layout/Header.jsx

"use client";

import NotificationPanel from "../notifications/NotificationPanel";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Sparkles,
  MessageCircle,
  Search,
  PenSquare,
  // Bell, // Removed Bell since NotificationPanel handles it internally
  Menu,
  LogOut,
  BadgeCheck,
} from "lucide-react";

import { useSubscription } from "../../app/subscription/SubscriptionContext";
import { useAuth } from "../../app/context/AuthContext";
import { api } from "../../lib/api";
import { getSearchSuggestions } from "../../lib/searchApi";

export default function Header({ onToggleSidebar }) {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { user, userProfile, logout } = useAuth(); // get user + logout from backend/auth

  const [open,     setOpen]     = useState(false);
  // Removed notiOpen state because NotificationPanel handles its own state internally
  const [mounted,  setMounted]  = useState(false);
  const menuRef = useRef(null);

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState("");
  const [suggestions,     setSuggestions]     = useState({ articles: [], users: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const debounceTimer      = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // derive user display values 
  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split("@") || "User";
  const displayEmail = user?.email || "";
  const avatarUrl =
    userProfile?.avatarUrl ||
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=1ABC9C&color=fff`;

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    if (!showSuggestions) return;
    const onDown = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showSuggestions]);

  // Debounced autocomplete fetch
  const fetchSuggestions = useCallback((value) => {
    clearTimeout(debounceTimer.current);
    if (!value || value.trim().length < 2) {
      setSuggestions({ articles: [], users: [] });
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await getSearchSuggestions(value.trim());
        setSuggestions(data || { articles: [], users: [] });
        const hasResults = (data?.articles?.length || 0) + (data?.users?.length || 0) > 0;
        setShowSuggestions(hasResults);
      } catch {
        setSuggestions({ articles: [], users: [] });
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  // Submit search → always opens Articles tab (no &tab param)
  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSuggestions(false);
    router.push(`/home?q=${encodeURIComponent(q)}`);
  }, [searchQuery, router]);

  // ── CHANGED: handleSuggestionClick now takes a `type` param ───────────────
  // "article" → no tab param → Articles tab (default)
  // "user"    → &tab=profiles → Profiles tab loads first
  const handleSuggestionClick = useCallback(
    (term, type = "article") => {
      setSearchQuery(term);
      setShowSuggestions(false);
      const tabParam = type === "user" ? "&tab=profiles" : "";
      router.push(`/home?q=${encodeURIComponent(term.trim())}${tabParam}`);
    },
    [router]
  );

  const [portalLoading, setPortalLoading] = useState(false);

  const handleMembershipClick = async (e) => {
    setOpen(false);
    if (!isPremium) return;
    e.preventDefault();
    if (!user) return;
    setPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const res   = await api.createStripePortalSession(token);
      const data  = res.data || res;
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  const membership = isPremium
    ? { label: "Manage Membership", href: "#" }
    : { label: "Become a Member",   href: "/subscription/upgrade" };

  const handleSignOut = async () => {
    try {
      setOpen(false);
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white border-b border-[#e5e7eb] px-6 flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <Link href="/home" className="flex items-center gap-2">
          <img src="/images/easy-blogger-logo.png" alt="Easy Blogger Logo" className="h-12 w-auto" />
          <h1 className="text-2xl font-bold text-[#1ABC9C] font-serif">Easy Blogger</h1>
        </Link>
      </div>

      {/* Search */}
      <div
        ref={searchContainerRef}
        className="flex-1 max-w-md mx-8 relative hidden md:block"
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer z-10"
          size={18}
          onClick={handleSearchSubmit}
        />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter")  handleSearchSubmit();
            if (e.key === "Escape") setShowSuggestions(false);
          }}
          onFocus={() => {
            const hasResults =
              (suggestions.articles?.length || 0) + (suggestions.users?.length || 0) > 0;
            if (hasResults) setShowSuggestions(true);
          }}
          placeholder="Search..."
          autoComplete="off"
          className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-[#e5e7eb] rounded-full text-sm outline-none focus:ring-1 ring-[#1ABC9C]"
        />

        {/* Autocomplete dropdown */}
        {mounted && showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">

            {suggestions.articles?.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Articles
                </p>
                {suggestions.articles.map((a) => (
                  <button
                    key={a.id}
                    onMouseDown={(e) => e.preventDefault()}
                    // type="article" → no &tab param → opens Articles tab
                    onClick={() => handleSuggestionClick(a.title, "article")}
                    className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#E8F8F5] hover:text-[#1ABC9C] transition-colors duration-100 truncate"
                  >
                    {a.title}
                  </button>
                ))}
              </>
            )}

            {suggestions.users?.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  People
                </p>
                {suggestions.users.map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={(e) => e.preventDefault()}
                    // type="user" → adds &tab=profiles → opens Profiles tab first
                    onClick={() => handleSuggestionClick(u.displayName || u.username, "user")}
                    className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#E8F8F5] hover:text-[#1ABC9C] transition-colors duration-100 flex items-center gap-2"
                  >
                    <img
                      src={
                        u.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          u.displayName || u.username
                        )}&background=1ABC9C&color=fff`
                      }
                      alt={u.displayName || u.username}
                      className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate">{u.displayName || u.username}</span>
                    {u.username && u.displayName && (
                      <span className="text-[#6B7280] text-xs ml-auto flex-shrink-0">
                        @{u.username}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}

            {/* "Search for …" footer */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSearchSubmit}
              className="w-full text-left px-4 py-2.5 text-sm text-[#1ABC9C] font-medium hover:bg-[#E8F8F5] transition-colors duration-100 border-t border-[#E5E7EB] flex items-center gap-2"
            >
              <Search size={14} />
              Search for &ldquo;{searchQuery}&rdquo;
            </button>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="relative flex items-center gap-3">
        <Link
          href="/write/choose-method"
          className="bg-[#1ABC9C] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#17a589]"
        >
          <PenSquare size={16} />
          <span className="hidden sm:inline">Write</span>
        </Link>

        {/* Replaced the manual button wrapper with the NotificationPanel component.
          It handles its own Bell icon and dropdown logic! 
        */}
        <NotificationPanel userId={user?.uid || user?.id} />

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
              <img src={avatarUrl} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </button>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 drop-shadow-md z-10">
                <BadgeCheck className="w-5 h-5 text-[#1ABC9C]" />
              </div>
            )}
          </div>

          {mounted && open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100">
              <div className={`w-17 h-17 rounded-full border-2 overflow-hidden mx-auto ${isPremium ? "border-amber-400" : "border-transparent"}`}>
                <img src={avatarUrl} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="px-4 py-2 border-none mb-1 text-sm mb-0">
                <p className="font-bold">
                  <Link href="/profile" className="flex items-center justify-between">
                    <span className="truncate">{displayName}</span>
                    {isPremium && <BadgeCheck className="w-5 h-5 text-[#1ABC9C] flex-shrink-0 ml-2" />}
                  </Link>
                </p>
                <p className="text-gray-500 text-xs truncate">{displayEmail}</p>
              </div>
              <div className="border-t border-[#e5e7eb] my-1" />
              <Link href="#" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                <HelpCircle size={16} /> Help
              </Link>
              <Link href="/chat" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                <MessageCircle size={16} /> Messages
              </Link>
              <Link href={membership.href} onClick={handleMembershipClick} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-amber-600">
                <Sparkles size={16} /> {membership.label}
              </Link>
              <div className="border-t border-[#e5e7eb] my-1" />
              <button type="button" onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-red-500">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}