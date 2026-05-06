"use client";

import Link from "next/link";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../../lib/firebase";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  GoogleIcon,
  FacebookIcon,
  EmailIcon,
} from "../../../components/ui/Icons";

/**
 * Primary authentication interface allowing existing users to enter the platform.
 Provides aggregated authentication methods (Email, Google, Facebook) bridging into a single unified session tracked by `AuthContext`.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const {
    user,
    isAdmin,
    loading: authLoading,
    profileLoading,
    bannedReason,
    clearBan,
  } = useAuth();

  // Watch for auth changes. Wait for profileLoading to finish so isAdmin is accurate.
  React.useEffect(() => {
    // Only redirect if we actively triggered a login request (to prevent auto-redirects
    // when just sitting on the page if they happen to have an old token resolving)
    if (!authLoading && !profileLoading && user && isAuthenticating) {
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/home");
      }
    }
    // If a ban was detected mid-login, reset the authenticating state so the form is re-enabled and the modal can be shown.
    if (bannedReason) {
      setIsAuthenticating(false);
    }
  }, [
    user,
    isAdmin,
    authLoading,
    profileLoading,
    isAuthenticating,
    bannedReason,
    router,
  ]);

  const emailInputRef = React.useRef(null);

  /**
   * @function handleGoogleLogin
   * @description Initiates the Firebase Google OAuth popup flow.
   */
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Let AuthContext handle the redirect via useEffect
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        // Browser blocked the popup — fall back to redirect flow
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Error logging in with Google", error);
        setError("Failed to log in with Google.");
        setIsAuthenticating(false);
      }
    }
  };

  /**
  Initiates the Firebase Facebook OAuth popup flow.
   */
  const handleFacebookLogin = async () => {
    setIsAuthenticating(true);
    setError("");
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      // Let AuthContext handle the redirect via useEffect
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        const provider = new FacebookAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Error logging in with Facebook", error);
        setError("Failed to log in with Facebook.");
        setIsAuthenticating(false);
      }
    }
  };

  /**
   email/password authnetication handler Validates the email format and credentials client-side before calling Firebase.
   */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsAuthenticating(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let AuthContext handle the redirect via useEffect
    } catch (err) {
      console.error("Error logging in with Email", err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Account temporarily disabled due to many failed login attempts. Please reset your password or try again later.",
        );
      } else {
        setError(err.message || "An error occurred during login.");
      }
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[#F8FAFC]">
        <div className="absolute left-0 top-0 w-1/3 h-full bg-linear-to-r from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
      </div>

      {/* Banned User Modal  */}
      {bannedReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Red accent bar at top */}
            <div className="h-1.5 w-full bg-red-500" />
            <div className="p-8 text-center">
              {/* Ban icon */}
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#111827] mb-2">
                Account Suspended
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
                {bannedReason}
              </p>
              <button
                onClick={clearBan}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6">
        <Link
          href="/"
          className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
          {/* Header */}
          <h1
            className="text-3xl font-bold text-center text-[#111827] mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Sign in to Easy Blogger
          </h1>
          <p className="text-center text-[#6B7280] text-sm mb-8">
            Welcome back. Continue reading, writing, and discovering stories.
          </p>

          {/* Social Sign-in Buttons */}
          <div className="space-y-3 mb-6">
            <Button variant="outline" onClick={handleGoogleLogin}>
              <GoogleIcon />
              Continue with Google
            </Button>
            <Button variant="outline" onClick={handleFacebookLogin}>
              <FacebookIcon />
              Continue with Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => emailInputRef.current?.focus()}
            >
              <EmailIcon />
              Continue with Email
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#E5E7EB]"></div>
            <span className="text-xs text-[#9CA3AF] uppercase">Or</span>
            <div className="flex-1 h-px bg-[#E5E7EB]"></div>
          </div>

          {/* Email/Password Form */}
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded mb-4 text-center">
                {error}
              </div>
            )}

            <Input
              ref={emailInputRef}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isAuthenticating || authLoading}
            >
              {isAuthenticating || authLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#6B7280] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#3B82F6] font-medium hover:text-[#2563EB] transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-sm text-[#9CA3AF]">
        © 2025 Easy Blogger. All rights reserved.
      </footer>
    </div>
  );
}
