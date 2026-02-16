// Admin Moderation Page
"use client";
import Link from "next/link";
import { Search, ChevronDown, LayoutTemplate } from "lucide-react";

export default function AdminModeration() {
  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 opacity-60 pointer-events-none select-none relative">
      
      {/* --- FAKE LEFT COLUMN (Ghost UI) --- */}
      <div className="w-1/3 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Moderation</h1>

        {/* Fake Status & Search */}
        <div className="flex gap-2">
          <div className="btn bg-[#E5E7EB] text-gray-400 border-none min-h-0 h-10 px-4 gap-2 rounded-lg w-28 flex justify-between">
            Status <ChevronDown size={16} />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
            <div className="w-full h-10 bg-[#E5E7EB] rounded-lg"></div>
          </div>
        </div>

        {/* Fake Toggle */}
        <div className="bg-[#F3F4F6] p-1 rounded-lg flex h-9">
          <div className="flex-1"></div>
          <div className="flex-1"></div>
        </div>

        {/* Fake List Items */}
        <div className="space-y-3 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB]"></div>
          ))}
        </div>
      </div>

      {/* --- FAKE RIGHT COLUMN --- */}
      <div className="w-2/3 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-center">
         {/* This overlay makes the page look "Waiting for input" */}
      </div>

      {/* --- THE REAL "SELECT MODE" OVERLAY --- */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-[#F0FDFA] text-[#1ABC9C] rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutTemplate size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Moderation Dashboard</h2>
          <p className="text-[#6B7280] mb-6 text-sm">Please select a category to begin reviewing.</p>
          
          <div className="flex gap-3 justify-center">
            <Link 
              href="/admin/moderation/queue" 
              className="btn bg-[#1ABC9C] hover:bg-[#16a085] text-white border-none rounded-lg px-6"
            >
              Go to Queue
            </Link>
            <Link 
              href="/admin/moderation/offers" 
              className="btn btn-outline border-gray-300 hover:bg-gray-50 text-[#111827] rounded-lg px-6"
            >
              Manage Offers
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
