"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../../lib/firebase";
import { API_BASE_URL, getHeaders } from "../../../../lib/api";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";

export default function EmailSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // Optional validation
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === "email"
        ? "email"
        : e.target.type === "password"
          ? e.target.placeholder.includes("Confirm")
            ? "confirmPassword"
            : "password"
          : "name"]: e.target.value,
    });
    // Simplification for brevity, better to use name attribute
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      // 2. Update profile with name
      await updateProfile(user, {
        displayName: formData.name,
      });

      // 3. Get token
      const token = await user.getIdToken();

      // 4. Sync with backend
      await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ name: formData.name }), // Optional: send name explicitly
      });

      router.push("/home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background similar to login */}
      <div className="absolute inset-0 bg-[#F8FAFC]">
        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#D1FAE5] via-[#E0F2FE] to-transparent opacity-60"></div>
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
