"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Newspaper, FileEdit } from "lucide-react";

export default function SelectMethodPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("");

  // When want to close the modal and go back to the previous page, can use the router.back() method
  const handleClose = () => router.back();

  // Button handlers
  const goAI = () => router.push("/ai-generate"); // AI editor page
  const goRegular = () => router.push("/write/create"); // Regular editor page

  // Mock user data - replace with actual user data from auth context
  const user = {
    name: "Emma Richarson",
    avatar: "https://i.pravatar.cc/150?img=1",
  };

  return (
    <div className="relative min-h-screen">
      {/* Background: Choose Method Page Content */}
      <div className="min-h-screen bg-linear-to-br from-[#E8F5F1] via-[#F0F9FF] to-[#FDF4FF] flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-12">
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
              <div className="w-full h-px bg-linear-to-r from-transparent via-[#E5E7EB] to-transparent mb-6"></div>

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
              <div className="group relative bg-linear-to-br from-[#D4F1E8] to-[#B8E8D8] rounded-2xl p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white/80 rounded-xl p-6 shadow-md">
                    <Newspaper className="w-16 h-16 text-[#1ABC9C]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#111827]">
                    Create a New Article
                  </h4>
                </div>
              </div>

              {/* Select from Unpublished Card */}
              <div className="group relative bg-linear-to-br from-[#D4F1E8] to-[#B8E8D8] rounded-2xl p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white/80 rounded-xl p-6 shadow-md">
                    <FileEdit className="w-16 h-16 text-[#1ABC9C]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#111827]">
                    Select from Unpublished
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dark overlay with modal */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
        {/* Modal */}
        <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl px-10 py-12">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title */}
          <h1 className="text-center text-4xl font-serif font-bold text-[#111827]">
            Create Your Article,
          </h1>

          {/* Divider */}
          <div className="mt-6 mb-10 h-px w-full bg-linear-to-r from-transparent via-[#E5E7EB] to-transparent" />

          {/* Buttons */}
          <div className="flex flex-col gap-6 items-center">
            {/* Using AI */}
            <button
              onClick={goAI}
              className="w-full max-w-sm rounded-full bg-[#1ABC9C] px-8 py-4 text-white text-lg font-semibold shadow-lg hover:opacity-95 active:scale-[0.99] transition"
            >
              Using AI
            </button>

            {/* Regular article */}
            <button
              onClick={goRegular}
              className="w-full max-w-sm rounded-full bg-black px-8 py-4 text-white text-lg font-semibold shadow-lg hover:opacity-95 active:scale-[0.99] transition"
            >
              As a Regular Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
