"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../../lib/firebase";

import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";

/**
 * @component EmailSignupPage
 * @description
 * Handles the manual registration flow using Email and Password.
 * @returns {JSX.Element} The email signup form.
 */
export default function EmailSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * @function handleInputChange
   * @description Dynamically updates the form state based on input name attributes.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * @function handleSubmit
   * @description
   * Executes the manual registration process sequentially.
    Creates the base user in Firebase Auth.
   Appends the `displayName` directly to the Firebase profile.
    Pauses execution slightly to allow `AuthContext` onAuthStateChanged to natively establish the Postgres record via the `/sync` API endpoint.Makes an explicit API call to update the newly minted Postgres record with the requested `displayName` before cleanly routing to the homepage.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.name,
      });

      const token = await user.getIdToken();

      try {
        const { api } = await import("../../../../lib/api");
        await new Promise((resolve) => setTimeout(resolve, 500));
        await api.updateProfile({ displayName: formData.name }, token);
      } catch (err) {
        console.error("Failed to sync name to backend during signup", err);
      }

      router.push("/home");
    } catch (err) {
      console.error("Signup validation error:", err);
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background similar to login */}
      <div className="absolute inset-0 bg-[#F8FAFC]">
        <div className="absolute left-0 top-0 w-1/3 h-full bg-linear-to-r from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
      </div>

      {/* Back Link */}
      <div className="relative z-10 p-6">
        <Link
          href="/signup"
          className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          ← Back
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
          <h1
            className="text-3xl font-bold text-center text-[#111827] mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Create an account
          </h1>
          <p className="text-center text-[#6B7280] text-sm mb-8">
            Enter your details to get started.
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#3B82F6] font-medium hover:text-[#2563EB] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
