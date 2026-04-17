"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { auth } from "../../../lib/firebase";

// Email Icon
const EmailIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1ABC9C"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const type = searchParams.get("type"); // "reset" or "verify"

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [error, setError] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResendStatus("");
    setError(false);

    try {
      if (type === "reset" && email) {
        await sendPasswordResetEmail(auth, email);
        setResendStatus("Reset link sent again! Check your inbox.");
      } else if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendStatus("Verification email sent again! Check your inbox.");
      } else {
        setError(true);
        setResendStatus(
          "Could not resend email. Please try submitting the form again.",
        );
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setResendStatus(
        err.code === "auth/too-many-requests"
          ? "Too many requests. Please wait a minute before retrying."
          : "Failed to resend. Please try again later.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
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

        <div className="px-10 py-14 text-center">
          {/* Email Icon in Circle */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#D1FAE5]/50 flex items-center justify-center">
              <EmailIcon />
            </div>
          </div>

          {/* Header */}
          <h1
            className="text-3xl font-bold text-[#111827] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Check your inbox
          </h1>
          <p className="text-[#9CA3AF] text-base mb-8 leading-relaxed">
            We've sent a link to your email.
            <br />
            Please follow the instructions in the email to continue using
            <br />
            Easy Blogger.
          </p>

          {/* Resend Status Message */}
          {resendStatus && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm ${
                error
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {resendStatus}
            </div>
          )}

          {/* Note */}
          {!resendStatus && (
            <p className="text-[#9CA3AF] text-sm mb-8">
              Click the button below if you didn't receive anything.
            </p>
          )}

          {/* Resend Email Button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-4 px-4 rounded-full text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#1ABC9C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : "Resend Email"}
          </button>

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
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background with gradient blobs */}
      <div className="absolute inset-0 bg-[#F8FAFC]">
        {/* Left gradient blob */}
        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
        {/* Right gradient blob */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
      </div>

      {/* Back to Home Link */}
      <div className="relative z-10 p-6">
        <Link
          href="/"
          className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Content wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<div className="relative z-10 flex-1 flex items-center justify-center px-4 -mt-8">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-[#9CA3AF]">
        © 2025 Easy Blogger. All rights reserved.
      </footer>
    </div>
  );
}
