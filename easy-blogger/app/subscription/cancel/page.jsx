"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { XCircle, ArrowLeft } from "lucide-react";

/**
 * Payment Cancelled Page
 * Shown when user cancels Stripe checkout
 */
export default function SubscriptionCancelPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-[#EF4444]" />
          </div>

          <h1
            className="text-3xl font-bold text-[#111827] mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Payment Cancelled
          </h1>

          <p className="text-[#6B7280] text-base mb-8 max-w-md mx-auto">
            Your payment was not processed. No charges have been made to your
            account. You can try again anytime.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/subscription/upgrade-to-premium")}
              className="px-6 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-[#E5E7EB] text-[#374151] rounded-xl font-medium hover:bg-[#F9FAFB] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
