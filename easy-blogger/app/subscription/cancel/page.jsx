"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { XCircle, ArrowLeft, Shield, Clock } from "lucide-react";

/**
 * Payment Cancelled Page
 * Shown when user cancels Stripe checkout
 */
export default function SubscriptionCancelPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] overflow-hidden">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out min-h-screen flex items-center justify-center ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div 
          className={`max-w-2xl w-full mx-auto px-6 py-12 transition-all duration-1000 transform ${
            mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
          }`}
        >
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-10 text-center relative shadow-[0_20px_50px_rgba(239,68,68,0.1)] border border-[#FEF2F2]">
            
            {/* Background Glows */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-[#EF4444] to-[#F87171] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-tl from-[#FCA5A5] to-[#FEF2F2] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

            {/* Cancel Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#EF4444] rounded-full opacity-10 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] rounded-full flex items-center justify-center shadow-inner border border-[#FCA5A5]/30">
                <XCircle className="w-10 h-10 text-[#EF4444]" />
              </div>
            </div>

            <h1
              className="text-4xl font-bold text-[#111827] mb-4 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Checkout Cancelled
            </h1>

            <p className="text-[#6B7280] text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Your payment process was safely interrupted. 
              <strong className="text-[#374151] font-semibold block mt-2">No charges were made to your account.</strong>
            </p>

            {/* Info Cards */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 relative z-10">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F9FAFB] border border-[#F3F4F6] flex-1">
                <div className="shrink-0 bg-white p-2 rounded-xl shadow-sm">
                  <Shield className="w-5 h-5 text-[#1ABC9C]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#374151]">Secure & Safe</p>
                  <p className="text-xs text-[#6B7280]">Your data is protected</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F9FAFB] border border-[#F3F4F6] flex-1">
                <div className="shrink-0 bg-white p-2 rounded-xl shadow-sm">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#374151]">Take Your Time</p>
                  <p className="text-xs text-[#6B7280]">Upgrade whenever ready</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => router.push("/subscription/upgrade-to-premium")}
                className="px-8 py-4 bg-[#111827] hover:bg-[#374151] text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Return to Plans
              </button>
              <button
                onClick={() => router.push("/home")}
                className="px-8 py-4 bg-white border-2 border-[#E5E7EB] text-[#4B5563] rounded-2xl font-semibold text-lg hover:border-[#1ABC9C] hover:text-[#1ABC9C] transition-all duration-300"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
