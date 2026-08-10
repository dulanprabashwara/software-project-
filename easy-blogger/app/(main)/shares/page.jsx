"use client";

import { useState } from "react";
import { Share2, Globe, Linkedin, Layers, Sparkles, CheckCircle2 } from "lucide-react";

export default function SharesPage() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Shares" },
    { id: "wordpress", label: "WordPress" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "both", label: "Both Platforms" },
  ];

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-[Georgia]">
            Shares
          </h1>
        </div>
        <p className="text-gray-500 text-sm md:text-base">
          Track and manage your published content across connected platforms: WordPress, LinkedIn, or both.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="space-y-8">
        {/* Section 1: WordPress */}
        {(activeTab === "all" || activeTab === "wordpress") && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">WordPress</h2>
                  <p className="text-xs text-gray-500">Articles shared directly to your WordPress site</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                WordPress Only
              </span>
            </div>

            <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl mt-4">
              <Globe className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">WordPress Shares Section</p>
              <p className="text-xs text-gray-400 mt-1">
                Content shared exclusively to WordPress will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Section 2: LinkedIn */}
        {(activeTab === "all" || activeTab === "linkedin") && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">LinkedIn</h2>
                  <p className="text-xs text-gray-500">Articles shared directly to your LinkedIn feed</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
                LinkedIn Only
              </span>
            </div>

            <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl mt-4">
              <Linkedin className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">LinkedIn Shares Section</p>
              <p className="text-xs text-gray-400 mt-1">
                Content shared exclusively to LinkedIn will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Section 3: Both (WordPress & LinkedIn) */}
        {(activeTab === "all" || activeTab === "both") && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Both Platforms</h2>
                  <p className="text-xs text-gray-500">Articles shared simultaneously to both WordPress and LinkedIn</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  WordPress
                </span>
                <span className="text-gray-300 text-xs">+</span>
                <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
                  LinkedIn
                </span>
              </div>
            </div>

            <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl mt-4">
              <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">Dual Shared Content Section</p>
              <p className="text-xs text-gray-400 mt-1">
                Articles published across both platforms simultaneously will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
