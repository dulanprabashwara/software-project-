"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Info, Calendar, CreditCard } from "lucide-react";

export default function ManageSubscriptionPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-[#111827] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Subscription & Billing
            </h1>
            <p className="text-[#6B7280] text-sm">
              Manage your plan and billing details.
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                      Current Plan
                    </span>
                    <span className="px-2 py-0.5 bg-[#D1FAE5] text-[#059669] text-xs font-medium rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#111827]">
                      Premium Plan
                    </h2>
                    <Info className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <p className="text-sm text-[#6B7280] mt-1">
                    You are currently subscribed to the Premium plan.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#111827]">$9.99</p>
                <p className="text-sm text-[#6B7280]">/month</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E5E7EB]">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">
                  Billing Cycle
                </p>
                <p className="text-sm text-[#111827] font-medium">Monthly</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">
                  Next Billing Date
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#3B82F6]" />
                  <p className="text-sm text-[#111827] font-medium">
                    July 15, 2025
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">
              Payment Method
            </h2>

            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#111827] rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    Visa ending in 4242
                  </p>
                  <p className="text-xs text-[#6B7280]">Expires 12/28</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors">
                Update
              </button>
            </div>

            <button className="mt-4 text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors">
              View billing history
            </button>
          </div>

          {/* Cancel Subscription Section */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <p className="text-sm text-[#6B7280] mb-4">
              Canceling your subscription will downgrade your account to the
              Free plan at the end of the billing cycle.
            </p>
            <button className="px-6 py-2.5 border border-[#DC2626] text-[#DC2626] rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
