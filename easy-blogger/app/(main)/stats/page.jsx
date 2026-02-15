/**
 * Stats Page - User Statistics Dashboard
 *
 * Route: /stats
 *
 * Purpose: Shows comprehensive statistics about user's articles and engagement
 *
 * Features:
 * - Total reads across all articles
 * - Total followers and following count
 * - Article performance metrics
 * - Engagement trends over time
 * - Top performing articles
 * - Audience demographics (Premium feature)
 */

"use client";

import { useState } from "react";

export default function StatsPage() {
  // NOTE: Header and Sidebar are provided by app/(main)/layout.jsx

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-[#111827] mb-8">Your Stats</h1>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Total Reads</p>
          <p className="text-3xl font-bold text-[#111827]">12.4K</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Followers</p>
          <p className="text-3xl font-bold text-[#111827]">842</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Following</p>
          <p className="text-3xl font-bold text-[#111827]">156</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Articles</p>
          <p className="text-3xl font-bold text-[#111827]">28</p>
        </div>
      </div>

      {/* Top Performing Articles */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">
          Top Performing Articles
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium text-[#111827]">Article Title {i}</p>
                <p className="text-sm text-gray-500">Published Dec {i}, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#1ABC9C]">
                  {(5 - i) * 1.2}K reads
                </p>
                <p className="text-sm text-gray-400">{(5 - i) * 45} likes</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">
          Engagement Over Time
        </h2>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Chart visualization will appear here</p>
        </div>
      </div>
    </div>
  );
}
