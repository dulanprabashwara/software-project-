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
import { GoogleIcon, FacebookIcon, EmailIcon } from "../../../components/ui/Icons";

/**
 * @component SignupPage
 * @description
<<<<<<< HEAD
 * High-level signup interface combining the landing page background with an overarching authentication modal.
=======
 * High-level signup interface combining the landing page background with an 
 * overarching authentication modal.
 * WHY: Provides a seamless onboarding experience where users can quickly spin up an 
 * account via social providers without leaving the context of the landing page's value proposition.
 * 
 * @returns {JSX.Element} The signup modal overlaying the root landing page.
>>>>>>> 0ef949266a633bef503ac6d9f48a1e1bd9f5915b
 */
export default function SignupPage() {
  const router = useRouter();

  /**
   * @function handleClose
<<<<<<< HEAD
   * @description Closes the modal by routing back to the landing page
=======
   * @description Closes the modal by routing back to the index.
>>>>>>> 0ef949266a633bef503ac6d9f48a1e1bd9f5915b
   */
  const handleClose = () => {
    router.push("/");
  };

  /**
   * @function handleGoogleSignup
   * @description Triggers the Firebase Google provider popup for instant registration.
   */
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Let AuthContext globally capture the state and redirect downstream
      router.push("/home");
    } catch (error) {
      console.error("Error signing up with Google", error);
    }
  };

  /**
   * @function handleFacebookSignup
   * @description Triggers the Firebase Facebook provider popup for instant registration.
   */
  const handleFacebookSignup = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      // Let AuthContext globally capture the state and redirect downstream
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
              <GoogleIcon className="w-5 h-5" />
              <span className="text-[#111827] text-sm">
                Sign up with Google
              </span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <FacebookIcon className="w-5 h-5" />
              <span className="text-[#111827] text-sm">
                Sign up with Facebook
              </span>
            </button>

            {/* Email */}
            <button
              onClick={() => router.push("/signup/email")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <EmailIcon className="w-5 h-5 text-gray-600" />
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
