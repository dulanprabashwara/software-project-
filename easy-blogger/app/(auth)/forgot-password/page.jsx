"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to verify-email page
    router.push("/verify-email");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background with gradient blobs - same as login page */}
      <div className="absolute inset-0 bg-[#F8FAFC]">
        {/* Left gradient blob */}
        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
        {/* Right gradient blob */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
      </div>

      {/* Back to Home Link */}
      <div className="relative z-10 p-8 pt-12">
        <Link
          href="/"
          className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors inline-flex items-center gap-1"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 -mt-8">
        <div
          className="w-full max-w-md bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow:
              "0 4px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
          }}
        >
          {/* Green/Teal to Blue gradient bar at top */}
          <div className="h-1.5 bg-gradient-to-r from-[#1ABC9C] to-[#3B82F6]"></div>

          <div className="px-10 py-14">
            {/* Header */}
            <h1
              className="text-3xl font-bold text-center text-[#111827] mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Forgot your password?
            </h1>
            <p className="text-center text-[#9CA3AF] text-sm mb-10 leading-relaxed">
              Enter your email address and we'll send you
              <br />a link to reset your password.
            </p>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1ABC9C] focus:bg-white transition-all"
              />

              {/* Send Reset Link Button */}
              <button
                type="submit"
                className="w-full py-4 px-4 rounded-full text-sm font-semibold bg-[#1ABC9C] text-white hover:bg-[#16a085] transition-colors shadow-sm"
              >
                Send Reset Link
              </button>
            </form>

            {/* Back to Sign In Link */}
            <div className="mt-6">
              <Link
                href="/login"
                className="w-full py-4 px-4 rounded-full text-sm font-semibold text-[#3B82F6] bg-white border border-[#E5E7EB] hover:border-[#1ABC9C] transition-all flex items-center justify-center gap-1"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-[#9CA3AF]">
        © 2025 Easy Blogger. All rights reserved.
      </footer>
    </div>
  );
}
