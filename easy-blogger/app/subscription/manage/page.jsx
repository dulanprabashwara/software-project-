"use client";

import { useState } from "react";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { Shield, Calendar, CreditCard } from "lucide-react";

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
              Manage your plan and billing details,
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 mb-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      CURRENT PLAN
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#D1FAE5] text-[#10B981] text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2
                      className="text-2xl text-[#111827]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Premium Plan
                    </h2>
                    <Shield className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    You are currently subscribed to the Premium plan,
                  </p>
                </div>
              </div>
              <div className="text-right flex items-baseline gap-1">
                <p className="text-2xl font-bold text-[#111827]">$9.99</p>
                <p className="text-sm text-[#6B7280]">/month</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-8 border-t border-[#F3F4F6]">
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
                  BILLING CYCLE
                </p>
                <p className="text-base text-[#111827] font-medium">Monthly</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
                  NEXT BILLING DATE
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#10B981]" />
                  <p className="text-base text-[#111827] font-medium">
                    July 15, 2025
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 mb-8 shadow-sm">
            <h2
              className="text-xl text-[#111827] mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Payment Method
            </h2>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E5E7EB] mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-[#111827] rounded flex items-center justify-center">
                  <div className="w-6 h-4 border border-white/50 rounded-sm relative">
                    <div className="absolute top-1 left-0 w-full h-px bg-white/50"></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#374151]">
                    Visa ending in 4242
                  </p>
                  <p className="text-xs text-[#9CA3AF]">Expires 12/28</p>
                </div>
              </div>
              <button className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors">
                Update
              </button>
            </div>

            <button className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors">
              View billing history
            </button>
          </div>

          {/* Cancel Subscription Section */}
          <div className="border-t border-[#E5E7EB] pt-8 flex items-start justify-between">
            <p className="text-sm text-[#9CA3AF] max-w-md">
              Canceling your subscription will downgrade your account to the
              Free plan at the end of the billing cycle.
            </p>
            <button className="px-6 py-2.5 border border-[#FDA4AF] text-[#F43F5E] rounded bg-white text-sm font-medium hover:bg-[#FFF1F2] transition-colors">
              Cancel
              <br />
              Subscription
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
