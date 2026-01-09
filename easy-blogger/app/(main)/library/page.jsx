/**
 * Library Page - Main Library View
 *
 * Route: /library
 *
 * Purpose: Shows user's saved articles, reacted articles, and reading history
 *
 * Features:
 * - Tab navigation: Saved | Reacted | History
 * - Article cards with thumbnail, title, excerpt
 * - Author info and date
 * - Comment count and rating
 * - Bookmark indicator
 *
 * This page displays all three sections with tab switching
 */

"use client";

import { useState } from "react";
import Link from "next/link";

// Placeholder article data
const savedArticles = [
  {
    id: 1,
    author: "Love Quinn",
    authorAvatar: null,
    date: "Dec 1, 2021",
    title: "Easy Cake Recipe for Chocolate Cake",
    excerpt:
      "Learn How to make the best chocolate cake with this 40 minute cake recipe, using ingredients you already have at home. Taste the sweetness of Swiss cuisine in the comfort of your home",
    thumbnail: "/placeholder-cake.jpg",
    comments: 13,
    rating: 4.2,
  },
  {
    id: 2,
    author: "Michael Chen",
    authorAvatar: null,
    date: "Dec 3, 2025",
    title: "The Complete Guide to Building Scalable Web Applications",
    excerpt:
      "Learn the essential principles, patterns, and best practices for creating web applications that can handle millions of users while maintaining performance and reliability.",
    thumbnail: "/placeholder-web.jpg",
    comments: 28,
    rating: 4.6,
  },
  {
    id: 3,
    author: "John Smith",
    authorAvatar: null,
    date: "Aug 3, 2029",
    title: "Time. A Comprehensive Analysis",
    excerpt:
      "Dive into the inner workings of the Time And Relative Dimension In Space with help of the doctor. Earn a chance to visit your favourite place in history. No prior knowledge needed.",
    thumbnail: "/placeholder-time.jpg",
    comments: 72,
    rating: 1.3,
  },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("saved");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-12 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === "saved"
                ? "text-[#111827]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Saved
            {activeTab === "saved" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("reacted")}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === "reacted"
                ? "text-[#111827]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Reacted
            {activeTab === "reacted" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === "history"
                ? "text-[#111827]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            History
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
        </div>

        {/* Article List */}
        <div className="space-y-6">
          {savedArticles.map((article) => (
            <article
              key={article.id}
              className="flex gap-6 pb-6 border-b border-gray-100"
            >
              {/* Article Content */}
              <div className="flex-1">
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span className="text-sm font-medium text-[#111827]">
                    {article.author}
                  </span>
                  <span className="text-sm text-gray-400">·</span>
                  <span className="text-sm text-gray-400">{article.date}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-[#111827] mb-2 hover:text-[#1ABC9C] cursor-pointer transition-colors">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{article.comments}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{article.rating}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-[#1ABC9C] hover:text-[#16a085]">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Tab Content Description */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          {activeTab === "saved" && <p>Articles you've bookmarked for later</p>}
          {activeTab === "reacted" && (
            <p>Articles you've liked or clapped for</p>
          )}
          {activeTab === "history" && <p>Articles you've recently read</p>}
        </div>
      </div>
    </div>
  );
}
