"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, Sparkles } from "lucide-react";

// Top navigation header component for the app layout
export default function Header({ onToggleSidebar }) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  // Mock user data
  const user = {
    name: "Dulan prabashwara",
    email: "rji**************@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=47",
    initials: "D",
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleSignOut = () => {
    // Handle sign out logic
    alert("Signing out...");
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#E5E7EB] z-50 h-16">
      <div className="h-full max-w-360 mx-auto px-6 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
          >
            <svg
              className="w-5 h-5 text-[#111827]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <span className="text-[#1ABC9C]">Easy </span>
            <span className="text-[#1ABC9C]">Blogger</span>
          </h1>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search stories, topics, and people..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-[#F8FAFC] border border-[#E5E7EB] rounded-full focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent placeholder-[#6B7280] transition-all duration-150"
            />
          </div>
        </div>

        {/* Right: Write button + Notifications + Avatar */}
        <div className="flex items-center gap-4">
          {/* Write button */}
          <Link href="/write/choose-method">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors duration-150">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Write
            </button>
          </Link>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-[#F8FAFC] rounded-full transition-colors duration-150">
            <svg
              className="w-6 h-6 text-[#6B7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full"></span>
          </button>

          {/* User avatar with dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E5E7EB] hover:border-[#1ABC9C] transition-colors duration-150"
            >
              <img
                src={user.avatar}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-50">
                {/* User Profile Section */}
                <div className="p-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#6B7280] flex items-center justify-center text-white text-lg font-semibold">
                      {user.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#111827] text-sm">
                        {user.name}
                      </p>
                      <Link
                        href="/profile"
                        className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Help Option */}
                <div className="py-2">
                  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F9FAFB] transition-colors text-left">
                    <HelpCircle className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-sm text-[#6B7280]">Help</span>
                  </button>
                </div>

                {/* Become a Premium Member */}
                <div className="border-t border-[#E5E7EB] py-3 px-4">
                  <Link
                    href="/subscription/upgrade"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    <span>Become a Premium member</span>
                    <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                  </Link>
                </div>

                {/* Sign Out Section */}
                <div className="border-t border-[#E5E7EB] py-3 px-4">
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-2"
                  >
                    Sign out
                  </button>
                  <p className="text-xs text-[#9CA3AF]">{user.email}</p>
                </div>

                {/* Footer Links */}
                <div className="border-t border-[#E5E7EB] py-3 px-4">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#9CA3AF]">
                    <a
                      href="#"
                      className="hover:text-[#6B7280] transition-colors"
                    >
                      About
                    </a>
                    <a
                      href="#"
                      className="hover:text-[#6B7280] transition-colors"
                    >
                      Blog
                    </a>
                    <a
                      href="#"
                      className="hover:text-[#6B7280] transition-colors"
                    >
                      Careers
                    </a>
                    <a
                      href="#"
                      className="hover:text-[#6B7280] transition-colors"
                    >
                      Privacy
                    </a>
                    <a
                      href="#"
                      className="hover:text-[#6B7280] transition-colors"
                    >
                      Terms
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#9CA3AF] mt-1">
                    <a
                      href="#"
                      className="hover:text-[#6B7280] transition-colors"
                    >
                      Text to speech
                    </a>
                    <a
                      href="#"
                      className="hover:text-[#6B7280] transition-colors"
                    >
                      More
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
