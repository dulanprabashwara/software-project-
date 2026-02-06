"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { Check, Zap, Info } from "lucide-react";

/**
 * Upgrade Page - Pricing Comparison
 *
 * Purpose: Shows pricing comparison between Free and Premium plans
 * Features: Side-by-side comparison with upgrade CTA
 */

export default function UpgradePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleUpgrade = () => {
    // Navigate to premium checkout page
    router.push("/subscription/upgrade-to-premium");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1
              className="text-4xl font-bold text-[#111827] mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Upgrade Your Experience
            </h1>
            <p className="text-[#6B7280] text-base">
              Unlock powerful tools to write, grow, and monetize your content.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan Card */}
            <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[#111827] mb-2">Free</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#111827]">$0</span>
                <span className="text-[#6B7280] text-base">/month</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B7280] text-sm">
                    Basic writing tools
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B7280] text-sm">
                    Limited analytics (7 days)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B7280] text-sm">
                    3 public posts per month
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B7280] text-sm">
                    Community access
                  </span>
                </li>
              </ul>

              {/* Current Plan Button */}
              <button className="w-full py-3 px-6 border-2 border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-colors">
                Current Plan
              </button>
            </div>

            {/* Premium Plan Card */}
            <div className="bg-white border-2 border-[#1ABC9C] rounded-2xl p-8 relative">
              {/* Most Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#1ABC9C] text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-[#111827]">Premium</h2>
                <Zap className="w-6 h-6 text-[#FBBF24] fill-[#FBBF24]" />
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[#111827]">$9.99</span>
                <span className="text-[#6B7280] text-base">/month</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 flex-shrink-0" />
                  <span className="text-[#111827] text-sm font-medium">
                    Access to AI Writer
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 flex-shrink-0" />
                  <span className="text-[#111827] text-sm font-medium">
                    Detailed Analytics & Insights
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 flex-shrink-0" />
                  <span className="text-[#111827] text-sm font-medium">
                    Unlimited Posts
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-[#111827] text-sm font-medium">
                      Verified badge on profile
                    </span>
                    <Info className="w-4 h-4 text-[#6B7280]" />
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 flex-shrink-0" />
                  <span className="text-[#111827] text-sm font-medium">
                    Priority support
                  </span>
                </li>
              </ul>

              {/* Upgrade Button */}
              <button
                onClick={handleUpgrade}
                className="w-full py-3 px-6 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-xl text-sm font-medium transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8">
            <p className="text-xs text-[#9CA3AF]">
              Prices in USD. Cancel anytime.{" "}
              <a href="#" className="hover:text-[#6B7280] transition-colors">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
