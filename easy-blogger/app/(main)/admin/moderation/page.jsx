"use client";
import Link from "next/link";
import { Search, ChevronDown, LayoutTemplate } from "lucide-react";

export default function ModerationIndexPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 relative bg-white">
      
      {/* --- GHOST UI BACKGROUND --- */}
      <div className="flex w-full gap-6 opacity-30 pointer-events-none select-none">
        <div className="w-1/3 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Moderation</h1>

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

          <div className="bg-[#F3F4F6] p-1 rounded-full flex h-9">
            <div className="flex-1 bg-white shadow-sm rounded-full"></div>
            <div className="flex-1"></div>
          </div>

          <div className="space-y-3 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB]"></div>
            ))}
          </div>
        </div>

        <div className="w-2/3 bg-white rounded-2xl border border-[#E5E7EB]"></div>
      </div>

      {/* --- SELECT MODE MODAL --- */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[2px] pointer-events-auto">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center max-w-lg animate-in fade-in zoom-in duration-300">
          
          <div className="w-20 h-20 bg-[#F0FDFA] text-[#1ABC9C] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <LayoutTemplate size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-[#111827] mb-3">Moderation Dashboard</h2>
          <p className="text-[#6B7280] mb-10 text-base font-medium">Please select a category to begin your reviewing session.</p>
          
          {/* UNIFIED BUTTON SET - NO TEXT WRAP */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/admin/moderation/queue" 
              className="whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:border-[#1ABC9C] hover:text-[#1ABC9C] hover:bg-[#F0FDFA] rounded-xl px-8 h-12 text-base font-bold flex items-center justify-center shadow-sm transition-all active:scale-95 w-full sm:w-auto"
            >
              Go to Queue
            </Link>
            <Link 
              href="/admin/moderation/offers" 
              className="whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:border-[#1ABC9C] hover:text-[#1ABC9C] hover:bg-[#F0FDFA] rounded-xl px-8 h-12 text-base font-bold flex items-center justify-center shadow-sm transition-all active:scale-95 w-full sm:w-auto"
            >
              Manage Offers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}