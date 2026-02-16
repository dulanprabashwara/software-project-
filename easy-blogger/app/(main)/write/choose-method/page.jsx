"use client";

import { useRouter } from "next/navigation";
import { Newspaper, FileEdit } from "lucide-react";

/**
 * Choose Writing Method Page
 *
 * Purpose: Let user choose between creating a new article or selecting from unpublished drafts
 * Flow: Shown after user clicks "Write" button from homepage
 *
 * Options available:
 * 1. Create a New Article → navigates to /write/create
 * 2. Select from Unpublished → navigates to /write/unpublished
 */

export default function ChooseMethodPage() {
  const router = useRouter();

  // Mock user data - replace with actual user data from auth context
  const user = {
    name: "Emma Richarson",
    avatar: "https://i.pravatar.cc/150?img=1",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F5F1] via-[#F0F9FF] to-[#FDF4FF] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#111827] mb-6">
              Let's Create Your Article...
            </h1>

            {/* User Profile */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#1ABC9C] shadow-lg"
              />
              <h2 className="text-2xl font-serif font-semibold text-[#111827]">
                {user.name}
              </h2>
            </div>

            {/* Divider */}

            {/* Subtitle */}
            <p className="text-[#6B7280] text-base">
              You have two options to create your article
            </p>
          </div>

          {/* Main Heading */}
          <h3 className="text-2xl font-medium text-[#111827] text-center mb-8">
            Would You Like To ,
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create New Article Card */}
            <button
              onClick={() => router.push("/write/create")}
              className="group relative bg-linear-to-br from-[#D4F1E8] to-[#B8E8D8] hover:from-[#1ABC9C] hover:to-[#16A085] rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/80 group-hover:bg-white rounded-xl p-6 transition-all duration-300 shadow-md">
                  <Newspaper className="w-16 h-16 text-[#1ABC9C] group-hover:text-[#16A085] transition-colors duration-300" />
                </div>
                <h4 className="text-xl font-bold text-[#111827] group-hover:text-white transition-colors duration-300">
                  Create a New Article
                </h4>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-[#1ABC9C]/0 to-[#16A085]/0 group-hover:from-[#1ABC9C]/10 group-hover:to-[#16A085]/10 transition-all duration-300"></div>
            </button>

            {/* Select from Unpublished Card */}
            <button
              onClick={() => router.push("/write/unpublished")}
              className="group relative bg-linear-to-br from-[#D4F1E8] to-[#B8E8D8] hover:from-[#1ABC9C] hover:to-[#16A085] rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/80 group-hover:bg-white rounded-xl p-6 transition-all duration-300 shadow-md">
                  <FileEdit className="w-16 h-16 text-[#1ABC9C] group-hover:text-[#16A085] transition-colors duration-300" />
                </div>
                <h4 className="text-xl font-bold text-[#111827] group-hover:text-white transition-colors duration-300">
                  Select from Unpublished
                </h4>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-[#1ABC9C]/0 to-[#16A085]/0 group-hover:from-[#1ABC9C]/10 group-hover:to-[#16A085]/10 transition-all duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
