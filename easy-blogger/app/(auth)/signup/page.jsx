// Sign Up Modal Page - Appears over landing page with shaded background
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { auth } from "../../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import { API_BASE_URL, getHeaders } from "../../../lib/api";

export default function SignupPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Sync with backend
      await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: "POST",
        headers: getHeaders(token),
      });

      router.push("/home");
    } catch (error) {
      console.error("Error signing up with Google", error);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Sync with backend
      await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: "POST",
        headers: getHeaders(token),
      });

      router.push("/home");
    } catch (error) {
      console.error("Error signing up with Facebook", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* ========== LANDING PAGE CONTENT IN BACKGROUND ========== */}

      {/* Header */}
      <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span className="text-[#111827]">Easy </span>
          <span className="text-[#111827]">Blogger</span>
        </h1>
        <nav className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors hidden md:block"
          >
            Our story
          </a>
          <a
            href="#"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors hidden md:block"
          >
            Membership
          </a>
          <a
            href="#"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors hidden md:block"
          >
            Write
          </a>
          <a
            href="#"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors"
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-[#111827] text-white text-sm rounded-full hover:bg-[#1f2937] transition-colors"
          >
            Get started
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center mt-8">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-stretch">
          {/* Left Content */}
          <div className="flex-1 py-12 md:py-0 flex flex-col justify-center pr-12">
            <h2
              className="text-6xl md:text-7xl lg:text-8xl font-serif leading-tight tracking-tight text-[#111827]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Human
              <br />
              stories &<br />
              ideas
            </h2>
            <p className="mt-8 text-lg md:text-xl text-[#374151] max-w-md">
              A place to read, write, and deepen your understanding
            </p>
            <a
              href="/login"
              className="inline-block mt-8 mb-16 px-6 py-3 bg-[#111827] text-white text-base rounded-full hover:bg-[#1f2937] w-fit"
            >
              Start reading
            </a>
          </div>

          {/* Vertical Divider Line */}
          <div className="hidden md:block w-px bg-[#E5E7EB] self-stretch"></div>

          {/* Right Illustration */}
          <div className="flex-1 relative hidden md:block pl-8 overflow-visible">
            <div className="relative w-full h-[500px]">
              <svg
                className="absolute top-24 left-8 w-48 h-48"
                viewBox="0 0 192 192"
              >
                <circle
                  cx="96"
                  cy="96"
                  r="85"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="1"
                />
                <line
                  x1="35"
                  y1="157"
                  x2="157"
                  y2="35"
                  stroke="#D1D5DB"
                  strokeWidth="1"
                />
              </svg>
              <svg
                className="absolute top-32 left-20 w-80 h-72 z-0"
                viewBox="0 0 320 288"
              >
                <polygon points="60,0 320,120 260,288 0,168" fill="#DBEAFE" />
              </svg>
              <div className="absolute top-8 right-0 w-52 h-52 rounded-full bg-[#1ABC9C] z-20"></div>
              <div className="absolute top-48 -right-12 w-64 h-44 bg-[#3B82F6] z-30"></div>
              <div className="absolute bottom-0 -right-12 w-72 h-64 bg-[#1ABC9C] z-30"></div>
              <svg
                className="absolute top-52 -right-12 w-64 h-40 z-40"
                viewBox="0 0 256 160"
              >
                <path
                  d="M0 80 Q64 20 128 80 T256 80 L256 160 L0 160 Z"
                  fill="#1ABC9C"
                />
              </svg>
              <div className="absolute bottom-16 right-8 w-28 h-24 bg-[#60A5FA] z-50"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Divider line */}
      <div className="w-full border-t border-[#E5E7EB]"></div>

      {/* Footer */}
      <footer className="w-full py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-[#6B7280]">
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Help
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Status
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            About
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Careers
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Press
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Blog
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Text to speech
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Teams
          </a>
        </div>
      </footer>

      {/* ========== MODAL OVERLAY ========== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
        {/* Shaded Background */}
        <div className="absolute inset-0 bg-white/80" onClick={handleClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-sm shadow-xl w-full max-w-md mx-4 px-12 py-10 animate-modal-pop">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title with underline */}
          <div className="text-center mb-8">
            <h1
              className="text-[28px] font-normal text-[#111827] pb-4 border-b border-gray-200"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Join Easy Blogger.
            </h1>
          </div>

          {/* Sign Up Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-[#111827] text-sm">
                Sign up with Google
              </span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-[#111827] text-sm">
                Sign up with Facebook
              </span>
            </button>

            {/* Email */}
            <button
              onClick={() => router.push("/signup/email")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-[#111827] text-sm">Sign up with email</span>
            </button>
          </div>

          {/* Sign In Link */}
          <p className="text-center mt-10 text-[#111827] text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1ABC9C] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center mt-8 text-xs text-[#6B7280] leading-relaxed">
            By clicking "Sign up", you accept Easy Blogger's{" "}
            <Link href="/terms" className="underline hover:text-[#111827]">
              Terms of Service
            </Link>{" "}
            and
            <br />
            <Link href="/privacy" className="underline hover:text-[#111827]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
