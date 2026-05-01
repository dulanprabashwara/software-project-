"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { api } from "../../../lib/api";

/**
 * /subscription/manage
 * Auto-redirects premium users to the Stripe Customer Portal.
 * Non-premium users are sent to the upgrade page.
 */

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    if (!isPremium) {
      router.replace("/subscription/upgrade");
      return;
    }

    // Premium user → redirect to Stripe Customer Portal
    const redirectToPortal = async () => {
      try {
        const token = await user.getIdToken();
        const res = await api.createPortalSession(token);
        const data = res.data || res;
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError("Could not generate portal link.");
        }
      } catch (err) {
        console.error("Portal redirect error:", err);
        setError(err.message || "Failed to open billing portal.");
      }
    };

    redirectToPortal();
  }, [user, isPremium]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="flex flex-col items-center justify-center py-32 text-center">
          {error ? (
            <div>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-[#1ABC9C] text-white rounded-lg"
              >
                Go Home
              </button>
            </div>
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-[#1ABC9C] mb-4" />
              <p className="text-[#6B7280] text-sm">
                Redirecting to Stripe billing portal...
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
