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
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";

// Google Icon
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

// Facebook Icon
const FacebookIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="#1877F2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18 9a9 9 0 1 0-10.406 8.89v-6.288H5.309V9h2.285V7.017c0-2.255 1.343-3.501 3.4-3.501.984 0 2.014.176 2.014.176v2.215h-1.135c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.602h-2.097v6.288A9.001 9.001 0 0 0 18 9z" />
  </svg>
);

// Email Icon
const EmailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6B7280"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Watch for auth changes. Once the user is fully fetched from the database, redirect them.
  React.useEffect(() => {
    // Only redirect if we actively triggered a login request (to prevent auto-redirects
    // when just sitting on the page if they happen to have an old token resolving)
    if (!authLoading && user && isAuthenticating) {
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/home");
      }
    }
  }, [user, isAdmin, authLoading, isAuthenticating, router]);

  const emailInputRef = React.useRef(null);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Let AuthContext handle the redirect via useEffect
    } catch (error) {
      console.error("Error logging in with Google", error);
      setError("Failed to log in with Google.");
      setIsAuthenticating(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsAuthenticating(true);
    setError("");
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      // Let AuthContext handle the redirect via useEffect
    } catch (error) {
      console.error("Error logging in with Facebook", error);
      setError("Failed to log in with Facebook.");
      setIsAuthenticating(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
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
            Don't have an account?{" "}
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
