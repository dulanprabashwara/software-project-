"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { CheckCircle, Sparkles, ArrowRight, Zap, Star, Crown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../../lib/api";

/**
 * Payment Success Page
 * Shown after successful Stripe checkout redirect
 */
export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleManagePlan = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await api.createPortalSession(token);
      const data = res.data || res;
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] overflow-hidden">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out min-h-screen flex items-center justify-center ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <div
          className={`max-w-2xl w-full mx-auto px-6 py-12 transition-all duration-1000 transform ${
            mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
          }`}
        >
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-10 text-center relative shadow-[0_20px_50px_rgba(26,188,156,0.15)] border border-[#E8F8F5]">

            {/* Background Glows */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-linear-to-br from-brand-primary to-[#34D399] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-linear-to-tr from-[#F59E0B] to-[#FCD34D] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>

            {/* Success Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-brand-primary rounded-full opacity-20 animate-ping"></div>
              <div className="relative w-full h-full bg-linear-to-br from-brand-primary to-brand-primary-hover rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1
              className="text-4xl font-bold text-brand-black mb-4 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Welcome to Premium! <span className="inline-block animate-bounce ml-2">🎉</span>
            </h1>

            <p className="text-brand-muted text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Your subscription is now active. The entire suite of Easy Blogger tools has been unlocked. Prepare to supercharge your writing journey.
            </p>

            {/* Premium Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left relative z-10">
              {[
                { text: "AI-powered writing assistant", icon: <Zap className="w-5 h-5 text-[#F59E0B]" /> },
                { text: "Advanced analytics & insights", icon: <Star className="w-5 h-5 text-brand-primary" /> },
                { text: "Unlimited article publishing", icon: <CheckCircle className="w-5 h-5 text-brand-blue" /> },
                { text: "Verified premium badge", icon: <Sparkles className="w-5 h-5 text-brand-blue" /> },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#F9FAFB] border border-[#F3F4F6] hover:border-brand-primary/30 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="shrink-0 bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-brand-muted">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => router.push("/write/choose-method")}
                className="px-8 py-4 bg-linear-to-r from-brand-primary to-brand-primary-hover hover:from-brand-primary-hover hover:to-brand-primary text-white rounded-full font-medium text-lg transition-all duration-300 shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                Start Writing Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleManagePlan}
                disabled={portalLoading}
                className="px-8 py-4 bg-white border-2 border-[#E5E7EB] text-brand-muted rounded-full font-medium text-lg hover:border-brand-primary hover:text-brand-primary hover:bg-[#F0FDF4] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-md"
              >
                {portalLoading ? "Loading..." : "Manage Plan"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
