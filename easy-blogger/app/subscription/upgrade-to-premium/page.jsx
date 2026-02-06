"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { ArrowLeft, CreditCard, Lock, Check } from "lucide-react";

/**
 * Upgrade to Premium Confirmation Page
 *
 * Purpose: Payment form for upgrading to Premium
 * Features: Account info, payment details, plan summary
 */

export default function UpgradeToPremiumPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingCountry, setBillingCountry] = useState("United States");
  const [promoCode, setPromoCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBackToPlans = () => {
    router.push("/subscription/upgrade");
  };

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, "");
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 16) {
      const formatted =
        numericValue.match(/.{1,4}/g)?.join(" ") || numericValue;
      setCardNumber(formatted);
    }
  };

  // Format expiry date (MM/YY)
  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      if (value.length >= 2) {
        setExpiryDate(value.slice(0, 2) + " / " + value.slice(2));
      } else {
        setExpiryDate(value);
      }
    }
  };

  // Format CVC (3 digits only)
  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvc(value);
    }
  };

  // Cardholder name (letters and spaces only)
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCardholderName(value);
  };

  const handleConfirmPayment = () => {
    if (!agreeToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    if (!cardholderName || !cardNumber || !expiryDate || !cvc) {
      alert("Please fill in all payment details");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      alert("Please enter a valid 16-digit card number");
      return;
    }
    if (cvc.length !== 3) {
      alert("Please enter a valid 3-digit CVC");
      return;
    }
    // Process payment
    alert("Payment processing... (Demo)");
  };

  // Comprehensive country list
  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  // Mock user data
  const user = {
    name: "Emma Richardson",
    email: "emma.richardson@example.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
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
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Back to Plans Link */}
          <button
            onClick={handleBackToPlans}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to plans</span>
          </button>

          {/* Page Header */}
          <h1
            className="text-3xl font-bold text-[#111827] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Upgrade to Premium
          </h1>
          <p className="text-[#6B7280] text-sm mb-8">
            Unlock powerful tools and grow your audience.
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Account & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Section */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#111827] mb-4">
                  account
                </h2>
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#111827]">{user.name}</p>
                      <span className="px-2 py-0.5 bg-[#1ABC9C] text-white text-xs rounded">
                        Upgrading
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280]">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Payment Details
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-red-500 rounded"></div>
                    <div className="w-8 h-6 bg-blue-500 rounded"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={handleNameChange}
                      placeholder="e.g. Emma Richardson"
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    />
                  </div>

                  {/* Card Information */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      Card Information
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        className="w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Expiry Date and CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        maxLength="7"
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cvc}
                        onChange={handleCvcChange}
                        placeholder="123"
                        maxLength="3"
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Billing Country */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      Billing Country
                    </label>
                    <select
                      value={billingCountry}
                      onChange={(e) => setBillingCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Secure Payment Notice */}
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-2">
                    <Lock className="w-4 h-4" />
                    <span>
                      Secure payment powered by Stripe. Your info is encrypted.
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm & Pay Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={!agreeToTerms}
                className="w-full py-4 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-xl text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Pay $9.99
              </button>
            </div>

            {/* Right Column - Premium Plan Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Premium Plan
                  </h2>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#111827]">$9.99</p>
                    <p className="text-xs text-[#6B7280]">/month</p>
                  </div>
                </div>

                <p className="text-sm text-[#6B7280] mb-4">
                  Billed monthly. Cancel anytime.
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#1ABC9C] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#374151]">
                      Access to AI Writer
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#1ABC9C] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#374151]">
                      Detailed Analytics & Insights
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#1ABC9C] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#374151]">
                      Unlimited Posts
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#1ABC9C] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#374151]">
                      Verified profile badge
                    </span>
                  </li>
                </ul>

                <div className="border-t border-[#E5E7EB] pt-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-[#374151]">
                      Total due today
                    </p>
                    <p className="text-lg font-bold text-[#111827]">$9.99</p>
                  </div>

                  {/* Promo Code */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    />
                    <button className="px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-lg text-sm font-medium transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#1ABC9C] border-[#E5E7EB] rounded focus:ring-[#1ABC9C]"
                  />
                  <label htmlFor="terms" className="text-xs text-[#6B7280]">
                    I agree to the{" "}
                    <a href="#" className="text-[#1ABC9C] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#1ABC9C] hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
