/**
 * Following Page - Users You Follow
 *
 * Route: /following
 *
 * Purpose: Shows list of users the current user is following and their latest content
 *
 * Features:
 * - List of followed users
 * - Latest articles from followed users
 * - Unfollow option
 * - Message option
 * - View profile option
 * - Activity feed from followed users
 */

"use client";

import { useState } from "react";

const followingUsers = [
  {
    id: 1,
    name: "David Miller",
    username: "davidmiller",
    bio: "Tech writer & entrepreneur",
    avatar: null,
    articlesCount: 45,
    followersCount: "2.3K",
  },
  {
    id: 2,
    name: "Sophia Anderson",
    username: "sophiaanderson",
    bio: "UX designer & storyteller",
    avatar: null,
    articlesCount: 32,
    followersCount: "1.8K",
  },
  {
    id: 3,
    name: "Alex Chen",
    username: "alexchen",
    bio: "AI researcher & blogger",
    avatar: null,
    articlesCount: 67,
    followersCount: "5.1K",
  },
  {
    id: 4,
    name: "Emma Wilson",
    username: "emmawilson",
    bio: "Travel writer & photographer",
    avatar: null,
    articlesCount: 89,
    followersCount: "3.2K",
  },
];

const latestArticles = [
  {
    id: 1,
    author: "David Miller",
    date: "Jan 8, 2026",
    title: "The Future of Web Development in 2026",
    excerpt:
      "Exploring the latest trends and technologies shaping the web development landscape.",
  },
  {
    id: 2,
    author: "Sophia Anderson",
    date: "Jan 7, 2026",
    title: "Designing for Accessibility: A Complete Guide",
    excerpt: "How to create inclusive designs that work for everyone.",
  },
  {
    id: 3,
    author: "Alex Chen",
    date: "Jan 6, 2026",
    title: "Understanding Large Language Models",
    excerpt: "A deep dive into how LLMs work and their applications.",
  },
];

export default function FollowingPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Following</h1>
        <p className="text-gray-500 mb-8">
          People you follow and their latest content
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === "users"
                ? "text-[#111827]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Users
            {activeTab === "users" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === "articles"
                ? "text-[#111827]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Latest Articles
            {activeTab === "articles" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {followingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-[#111827]">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.bio}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user.articlesCount} articles · {user.followersCount}{" "}
                      followers
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm border border-gray-200 rounded-full hover:border-red-400 hover:text-red-400 transition-colors">
                    Unfollow
                  </button>
                  <button className="px-4 py-2 text-sm border border-gray-200 rounded-full hover:border-[#1ABC9C] transition-colors">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Latest Articles Tab */}
        {activeTab === "articles" && (
          <div className="space-y-6">
            {latestArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <span className="text-sm font-medium text-[#111827]">
                    {article.author}
                  </span>
                  <span className="text-sm text-gray-400">·</span>
                  <span className="text-sm text-gray-400">{article.date}</span>
                </div>
                <h2 className="text-xl font-bold text-[#111827] mb-2 hover:text-[#1ABC9C] cursor-pointer transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-500 text-sm">{article.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
