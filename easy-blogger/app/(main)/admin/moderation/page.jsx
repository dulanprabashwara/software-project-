"use client";
import Link from "next/link";
import { Search, ChevronDown, LayoutTemplate } from "lucide-react";

export default function ModerationIndexPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 relative">
      
      {/* --- GHOST UI BACKGROUND (Low opacity to focus on modal) --- */}
      <div className="flex w-full gap-6 opacity-30 pointer-events-none select-none">
        
        {/* --- FAKE LEFT COLUMN --- */}
        <div className="w-1/3 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Moderation</h1>

          {/* Status Bar*/}
          <div className="flex gap-2">
            <div className="btn bg-[#E5E7EB] text-gray-500 border-none min-h-0 h-10 px-4 rounded-lg w-28 flex items-center justify-between">
              <span className="text-sm">Status</span> 
              <ChevronDown size={16} />
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
        </div>
      </div>

      {/* --- THE REAL "SELECT MODE" MODAL --- 
          Added bg-black/20 and backdrop-blur for better visibility */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[2px] pointer-events-auto">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center max-w-md animate-in fade-in zoom-in duration-300">
          
          <div className="w-20 h-20 bg-[#F0FDFA] text-[#1ABC9C] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <LayoutTemplate size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-[#111827] mb-3">Moderation Dashboard</h2>
          <p className="text-[#6B7280] mb-8 text-base">Please select a category to begin your reviewing session.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admin/moderation/queue" 
              className="btn bg-[#1ABC9C] hover:bg-[#16a085] text-white border-none rounded-xl px-8 h-12 normal-case text-base flex items-center justify-center"
            >
              Go to Queue
            </Link>
            <Link 
              href="/admin/moderation/offers" 
              className="btn btn-outline border-gray-300 hover:bg-gray-50 text-[#111827] rounded-xl px-8 h-12 normal-case text-base flex items-center justify-center"
            >
              Manage Offers
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}