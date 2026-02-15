"use client";

import { useState, use, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  FileText,
} from "lucide-react";
import ArticleCard from "../../../../components/article/ArticleCard";

export default function UserProfilePage({ params }) {
  const unwrappedParams = use(params);
  const [activeTab, setActiveTab] = useState("home");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyLink = () => {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("Profile link copied to clipboard!");
          setShowMenu(false);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          fallbackCopyTextToClipboard(url);
        });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        alert("Profile link copied to clipboard!");
        setShowMenu(false);
      } else {
        alert("Failed to copy link.");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      alert("Failed to copy link.");
    }

    document.body.removeChild(textArea);
  };

  // Mock Data matching Figma
  const user = {
    name: "Phil Jackson",
    username: unwrappedParams.username || "philjackson",
    avatar: "https://i.pravatar.cc/150?img=11",
    bio: "Senior Editorial Director, Features The Wall Street Journal Author Kingston by Starlight, Before the Legend, Game World",
    followers: "2.K",
    following: "142",
  };

  const articles = [
    {
      id: 1,
      authorName: user.name,
      authorAvatar: user.avatar,
      verified: true,
      date: "Dec 4, 2025",
      title: "How AI is Transforming Content Creation in 2025",
      description:
        "Explore the latest developments in artificial intelligence and how they are revolutionizing the way we create, curate, and consume content across digital platforms.",
      thumbnail:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop",
      comments: 42,
      likes: 4.8,
    },
    {
      id: 2,
      authorName: user.name,
      authorAvatar: user.avatar,
      verified: true,
      date: "Nov 25, 2025",
      title: "Designing for Accessibility in 2025",
      description:
        "A deep dive into the design thinking process and how it can help teams solve complex problems, innovate faster, and create products that truly resonate with users.",
      thumbnail:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      comments: 35,
      likes: 4.9,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* Main Content Area - Left Side */}
      <div className="flex-1 overflow-y-auto scrollbar-hide border-r border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Header Name & Options */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[40px] font-bold text-[#111827] font-serif">
              {user.name}
            </h1>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy link to profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-100 mb-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("home")}
                className={`pb-4 text-[15px] font-medium transition-colors relative ${
                  activeTab === "home"
                    ? "text-[#111827]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Home
                {activeTab === "home" && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-[#111827]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`pb-4 text-[15px] font-medium transition-colors relative ${
                  activeTab === "about"
                    ? "text-[#111827]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                About
                {activeTab === "about" && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-[#111827]" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "home" ? (
            <div className="space-y-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-3">
                About {user.name}
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {user.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - User Info */}
      <div className="w-90 shrink-0 overflow-y-auto border-l border-[#F2F2F2] px-8 py-10">
        <div className="sticky top-10">
          <div className="mb-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-22 h-22 rounded-full object-cover"
            />
          </div>

          <h2 className="text-base font-bold text-[#111827] mb-1 font-serif">
            {user.name}
          </h2>

          <div className="flex items-center gap-1 text-[13px] text-gray-500 mb-3">
            <Link
              href={`/profile/${user.username}/stats?tab=followers`}
              className="hover:text-gray-900 transition-colors"
            >
              <span className="font-medium text-[#111827]">
                {user.followers}
              </span>{" "}
              Followers
            </Link>
            <span>·</span>
            <Link
              href={`/profile/${user.username}/stats?tab=following`}
              className="hover:text-gray-900 transition-colors"
            >
              <span className="font-medium text-[#111827]">
                {user.following}
              </span>{" "}
              Following
            </Link>
          </div>

          <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
            {user.bio}
          </p>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                isFollowing
                  ? "border border-gray-300 text-gray-700 hover:border-gray-800"
                  : "bg-[#1ABC9C] text-white hover:bg-[#16a085]"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <Link
              href="/chat"
              className="flex-1 px-4 py-2 rounded-full text-[14px] font-medium bg-[#1ABC9C] text-white hover:bg-[#16a085] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
          </div>

          {/* Optional: Add section for "More from Medium" or similar if needed */}
        </div>
      </div>
    </div>
  );
}
