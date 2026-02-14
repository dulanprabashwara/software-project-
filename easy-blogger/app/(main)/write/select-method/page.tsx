"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";

export default function SelectMethodPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("");
  
  // When want to close the modal and go back to the previous page, can use the router.back() method
  const handleClose = () => router.back();

  // Button handlers
  const goAI = () => router.push("/write/ai-generate"); // AI editor page
  const goRegular = () => router.push("/write/create"); // Regular editor page

  return (
    <div className="relative min-h-screen">
      <div className="min-h-screen bg-linear-to-br from-[#E8F5F1] via-[#F0F9FF] to-[#FDF4FF]" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
        {/* Modal */}
        <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl px-10 py-12">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            
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
