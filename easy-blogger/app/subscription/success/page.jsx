"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

/**
 * Payment Success Page
 * Shown after successful Stripe checkout redirect
 */
export default function SubscriptionSuccessPage() {
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
          {/* Success Icon */}
          <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#10B981]" />
          </div>

          <h1
            className="text-3xl font-bold text-[#111827] mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Welcome to Premium! 🎉
          </h1>

          <p className="text-[#6B7280] text-base mb-8 max-w-md mx-auto">
            Your subscription is now active. You have access to all premium
            features including AI Writer, unlimited posts, and detailed analytics.
          </p>

          {/* Premium Features */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#FBBF24]" />
              <h2 className="font-semibold text-[#111827]">
                What's unlocked for you
              </h2>
            </div>
            <ul className="space-y-2">
              {[
                "AI-powered writing assistant",
                "Advanced analytics & insights",
                "Unlimited article publishing",
                "Verified premium badge on your profile",
                "Priority support",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-[#374151]"
                >
                  <CheckCircle className="w-4 h-4 text-[#1ABC9C] shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              Start Writing
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/subscription/manage")}
              className="px-6 py-3 border border-[#E5E7EB] text-[#374151] rounded-xl font-medium hover:bg-[#F9FAFB] transition-colors"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
