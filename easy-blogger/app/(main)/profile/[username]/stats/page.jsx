/**
 * User Stats Page - Unified Statistics View
 *
 * Route: /profile/[username]/stats
 *
 * Purpose: Displays Followers, Following, Reads, and Writes
 * in one single UI using tabs/selectable sections.
 *
 * Used for:
 * - Logged-in user's own profile (viewing your own stats)
 * - Viewing another user's profile stats
 *
 * Behavior changes based on whether [username] is the current user:
 *
 * ============================================
 * SECTION BEHAVIOR DIFFERENCES:
 * ============================================
 *
 * FOLLOWERS SECTION:
 * - If viewing OWN profile:
 *   → Show "Message" button next to each follower
 * - If viewing OTHER user's profile:
 *   → Show "Follow" and "Message" buttons next to each follower
 *
 * FOLLOWING SECTION:
 * - If viewing OWN profile:
 *   → Show "Unfollow" and "Message" buttons
 * - If viewing OTHER user's profile:
 *   → Show "Follow" and "Message" buttons
 *
 * READS SECTION:
 * - Read-only view for both own and other profiles
 * - List of articles read by the user
 * - Click to navigate to article
 *
 * WRITES SECTION:
 * - Read-only view for both own and other profiles
 * - List of articles written by the user
 * - Click to navigate to article
 *
 * ============================================
 */

"use client";

import { useState } from "react";

export default function UserStatsPage({ params }) {
  // Track which tab/section is currently active
  const [activeTab, setActiveTab] = useState("followers");

  // In real implementation, compare params.username with logged-in user
  // to determine if viewing own profile or another user's profile
  const isOwnProfile = false; // Placeholder - would be determined by auth

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* ==================== */}
        {/* HEADER SECTION */}
        {/* ==================== */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">@username's Stats</h1>
          <p className="text-gray-500">
            {isOwnProfile
              ? "Viewing your own statistics"
              : "Viewing another user's statistics"}
          </p>
        </div>

        {/* ==================== */}
        {/* SECTION SWITCHER (TABS) */}
        {/* ==================== */}
        {/* 
          Only one section is visible at a time.
          User clicks a tab to switch between sections.
        */}
        <div className="flex justify-center gap-2 mb-8 border-b pb-4">
          <button
            onClick={() => setActiveTab("followers")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "followers"
                ? "bg-[#1ABC9C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "following"
                ? "bg-[#1ABC9C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveTab("reads")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "reads"
                ? "bg-[#1ABC9C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Reads
          </button>
          <button
            onClick={() => setActiveTab("writes")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "writes"
                ? "bg-[#1ABC9C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Writes
          </button>
        </div>

        {/* ==================== */}
        {/* CONTENT SECTIONS */}
        {/* ==================== */}

        {/* FOLLOWERS SECTION */}
        {/* 
          Own Profile: Show "Message" button
          Other Profile: Show "Follow" + "Message" buttons
        */}
        {activeTab === "followers" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Followers (124)</h2>

            {/* Placeholder follower items */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium">User Name {i}</p>
                    <p className="text-sm text-gray-500">@username{i}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Show different buttons based on profile ownership */}
                  {!isOwnProfile && (
                    <button className="px-3 py-1 text-sm border rounded-full hover:border-[#1ABC9C]">
                      Follow
                    </button>
                  )}
                  <button className="px-3 py-1 text-sm border rounded-full hover:border-[#1ABC9C]">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOLLOWING SECTION */}
        {/* 
          Own Profile: Show "Unfollow" + "Message" buttons
          Other Profile: Show "Follow" + "Message" buttons
        */}
        {activeTab === "following" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Following (89)</h2>

            {/* Placeholder following items */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium">Following User {i}</p>
                    <p className="text-sm text-gray-500">@following{i}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Show different buttons based on profile ownership */}
                  {isOwnProfile ? (
                    <button className="px-3 py-1 text-sm border rounded-full hover:border-red-400 hover:text-red-400">
                      Unfollow
                    </button>
                  ) : (
                    <button className="px-3 py-1 text-sm border rounded-full hover:border-[#1ABC9C]">
                      Follow
                    </button>
                  )}
                  <button className="px-3 py-1 text-sm border rounded-full hover:border-[#1ABC9C]">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* READS SECTION */}
        {/* 
          Read-only view for both own and other profiles
          Shows list of articles read by the user
        */}
        {activeTab === "reads" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Articles Read (256)</h2>

            {/* Placeholder read articles */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border rounded-lg hover:border-[#1ABC9C] cursor-pointer transition-colors"
              >
                <h3 className="font-medium mb-1">Article Title {i}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  A short preview of the article content goes here...
                </p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>By @author{i}</span>
                  <span>Read on Jan {i}, 2026</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WRITES SECTION */}
        {/* 
          Read-only view for both own and other profiles
          Shows list of articles written by the user
        */}
        {activeTab === "writes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              Articles Written (42)
            </h2>

            {/* Placeholder written articles */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border rounded-lg hover:border-[#1ABC9C] cursor-pointer transition-colors"
              >
                <h3 className="font-medium mb-1">My Article Title {i}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  A short preview of the written article content...
                </p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Published Jan {i}, 2026</span>
                  <span>1.2k reads</span>
                  <span>45 likes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
