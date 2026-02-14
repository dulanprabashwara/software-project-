// Profile page - Shows user's profile with their articles
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSubscription } from "../../subscription/SubscriptionContext";
import ArticleCard from "../../../components/article/ArticleCard";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const { isPremium } = useSubscription();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock user data
  const user = {
    name: "Emma Richardson",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
    followers: "2.4K",
    following: 142,
    reads: "45.2K",
    shares: 892,
    messages: 10,
  };

  // Mock articles data
  const articles = [
    {
      id: 1,
      authorName: "Emma Richardson",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      verified: false,
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
      authorName: "Emma Richardson",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      verified: false,
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
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 bg-white h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="flex h-full w-full">
          {/* Main Content Area */}
          <div className="flex-1 border-r border-[#E5E7EB] overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
            <div className="max-w-3xl mx-auto px-8 py-8">
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-6">
                <h1
                  className="text-3xl font-bold text-[#111827]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {user.name}
                </h1>
                <button className="p-2 hover:bg-[#F8FAFC] rounded-full transition-colors duration-150">
                  <svg
                    className="w-6 h-6 text-[#6B7280]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-[#E5E7EB] mb-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab("home")}
                    className={`pb-3 text-sm font-medium transition-colors ${
                      activeTab === "home"
                        ? "text-[#111827] border-b-2 border-[#111827]"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`pb-3 text-sm font-medium transition-colors ${
                      activeTab === "about"
                        ? "text-[#111827] border-b-2 border-[#111827]"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    About
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "home" ? (
                <div>
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="py-8">
                  {/* About Section - Empty State */}
                  <div className="border border-[#E5E7EB] rounded-lg p-8 text-center max-w-xl mx-auto">
                    <h3 className="text-lg font-semibold text-[#111827] mb-3">
                      Tell the world about yourself
                    </h3>
                    <p className="text-[#6B7280] text-sm mb-6 leading-relaxed">
                      Here's where you can share more about yourself: your
                      history, work experience, accomplishments, interests,
                      dreams, and more.
                    </p>
                    <button className="px-6 py-2.5 border border-[#111827] text-[#111827] rounded-full text-sm font-medium hover:bg-[#111827] hover:text-white transition-colors duration-150">
                      Get started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-70 shrink-0 bg-white px-6 py-8 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
            <div className="flex flex-col justify-between h-full">
              {/* Profile Card */}
              <div>
                {/* Avatar */}
                <div className="mb-4 relative inline-block">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`w-20 h-20 rounded-full object-cover border-2 ${
                      isPremium ? "border-[#F59E0B]" : "border-transparent"
                    }`}
                  />
                  {/* Verified Badge for Premium */}
                  {isPremium && (
                    <div className="absolute -bottom-1 -right-1 transform translate-x-1/4 translate-y-1/4 drop-shadow-md">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.5 12.5L20.1 15.3L20.4 19L16.8 19.8L14.9 23L11.5 21.6L8.1 23L6.2 19.8L2.6 19L2.9 15.3L0.5 12.5L2.9 9.7L2.6 6L6.2 5.2L8.1 2L11.5 3.4L14.9 2L16.8 5.2L20.4 6L20.1 9.7L22.5 12.5Z"
                          fill="#1ABC9C"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7 12L10 15L16 9"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-base font-bold text-[#111827] mb-2 flex items-center gap-2">
                  {user.name}
                </h2>

                {/* Stats Row 1 */}
                <p className="text-sm text-[#6B7280] mb-1">
                  <a
                    href="/profile/user_stats?tab=followers"
                    className="hover:underline cursor-pointer"
                  >
                    {user.followers} Followers
                  </a>
                  {" · "}
                  <a
                    href="/profile/user_stats?tab=following"
                    className="hover:underline cursor-pointer"
                  >
                    {user.following} Following
                  </a>
                </p>

                {/* Stats Row 2 */}
                <p className="text-sm text-[#6B7280] mb-4">
                  <a
                    href="/profile/user_stats?tab=reads"
                    className="hover:underline cursor-pointer"
                  >
                    {user.reads} Reads
                  </a>
                  {" · "}
                  <a
                    href="/profile/user_stats?tab=shares"
                    className="hover:underline cursor-pointer"
                  >
                    {user.shares} Shares
                  </a>
                  {" · "}
                  <Link href="/chat" className="hover:underline cursor-pointer">
                    {user.messages} Messages
                  </Link>
                </p>

                {/* Edit Profile Link */}
                <a
                  href="/profile/edit"
                  className="text-sm text-[#1ABC9C] hover:text-[#17a589] transition-colors"
                >
                  Edit profile
                </a>
              </div>

              {/* Footer Links */}
              <div className="pt-4">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#6B7280]">
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Help
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Status
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Careers
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Press
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Blog
                  </a>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#6B7280] mt-2">
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Privacy
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Terms
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Text to speech
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#111827] transition-colors"
                  >
                    Teams
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
