"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { ArrowLeft, Loader2, Lock, Check, Zap, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../../lib/api";

/**
 * Upgrade to Premium Page
 * Redirects user to Stripe Hosted Checkout
 */
export default function UpgradeToPremiumPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offersLoading, setOffersLoading] = useState(true);

  const MONTHLY_PRICE = 9.99;

  useEffect(() => {
    fetchOffers();
  }, []);
  //fetch the active offers from the api
  const fetchOffers = async () => {
    try {
      const res = await api.getActiveOffers();
      const data = res.data || res;
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setOffersLoading(false);
    }
  };

  //handle the checkout process to direct user to stripe checkout page by passing the selected offerid and jwt token to backend
  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await api.createCheckoutSession(
        selectedOffer?.id || null,
        token,
      );
      const data = res.data || res;

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  //calculate the discounted price
  const discountedPrice = selectedOffer
    ? MONTHLY_PRICE * (1 - selectedOffer.discount_percent / 100)
    : MONTHLY_PRICE;

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push("/subscription/upgrade")}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to plans</span>
          </button>

          {/* Header */}
          <h1
            className="text-3xl font-bold text-[#111827] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Upgrade to Premium
          </h1>
          <p className="text-[#6B7280] text-sm mb-8">
            You will be redirected to Stripe's secure checkout page.
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column — Offers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Offers */}
              {offersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
                </div>
              ) : offers.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#1ABC9C]" />
                    Available Offers
                  </h2>
                  {offers.map((offer) => (
                    <button
                      key={offer.id}
                      onClick={() =>
                        setSelectedOffer(
                          selectedOffer?.id === offer.id ? null : offer,
                        )
                      }
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                        selectedOffer?.id === offer.id
                          ? "border-[#1ABC9C] bg-[#F0FDFA] shadow-md"
                          : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#111827]">
                            {offer.name}
                          </p>
                          <p className="text-sm text-[#6B7280] mt-1">
                            {offer.discount_percent}% off your subscription
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#1ABC9C]">
                            -{offer.discount_percent}%
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedOffer?.id === offer.id
                                ? "border-[#1ABC9C] bg-[#1ABC9C]"
                                : "border-[#D1D5DB]"
                            }`}
                          >
                            {selectedOffer?.id === offer.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {selectedOffer && (
                    <p className="text-xs text-[#6B7280] italic">
                      Coupon will be applied automatically at checkout.
                    </p>
                  )}
                </div>
              ) : null}

              {/* Secure Checkout Notice */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-[#111827] text-sm">
                      Secure Payment via Stripe
                    </p>
                    <p className="text-[#6B7280] text-xs mt-1">
                      Your payment details are handled entirely by Stripe. We
                      never see or store your card information. You can cancel
                      anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-xl text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Proceed to Checkout — ${discountedPrice.toFixed(2)}/mo
                  </>
                )}
              </button>
            </div>

            {/* Right Column — Plan Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Premium Plan
                  </h2>
                  <div className="text-right">
                    {selectedOffer ? (
                      <>
                        <p className="text-sm text-[#9CA3AF] line-through">
                          ${MONTHLY_PRICE}
                        </p>
                        <p className="text-2xl font-bold text-[#1ABC9C]">
                          ${discountedPrice.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-[#111827]">
                        ${MONTHLY_PRICE}
                      </p>
                    )}
                    <p className="text-xs text-[#6B7280]">/month</p>
                  </div>
                </div>

                <p className="text-sm text-[#6B7280] mb-4">
                  Billed monthly. Cancel anytime.
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    "Access to AI Writer",
                    "Detailed Analytics & Insights",
                    "Unlimited Posts",
                    "Verified profile badge",
                    "Priority support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#1ABC9C] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#374151]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#E5E7EB] pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#374151]">
                      Total due today
                    </p>
                    <p className="text-lg font-bold text-[#111827]">
                      ${discountedPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
