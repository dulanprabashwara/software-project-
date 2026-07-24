"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";

export default function HelpPage() {
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await api.submitSupportRequest({ email, problem });

      setStatus("success");
      setEmail("");
      setProblem("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Support Request Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Help & Support</h1>
          <p className="text-gray-600 mb-8">
            Having trouble? Describe your problem below and we will get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-[#1ABC9C] transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your problem
              </label>
              <textarea
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-[#1ABC9C] transition-all resize-none"
                placeholder="What went wrong?"
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full sm:w-auto px-8 py-3 bg-[#1ABC9C] text-white font-medium rounded-xl hover:bg-[#17a589] transition-colors disabled:opacity-70"
            >
              {status === "submitting" ? "Submitting..." : "Submit Request"}
            </button>

            {status === "success" && (
              <p className="text-green-600 text-sm font-medium">Your request has been submitted successfully!</p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-sm font-medium">Failed to submit your request. Please try again later.</p>
            )}
          </form>
        </div>

        {/* Tutorials Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Tutorials</h2>
          <p className="text-gray-600 mb-6">
            Learn how to use Easy Blogger with our step-by-step guides.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/help/tutorials/how-to-write-article"
              className="block p-6 border border-gray-100 rounded-xl hover:border-[#1ABC9C] hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#1ABC9C] transition-colors mb-2">
                How to Write an Article
              </h3>
              <p className="text-sm text-gray-500">
                A complete guide with pictures on how to use the editor and publish your first article.
              </p>
            </Link>

            <Link 
              href="/help/tutorials/how-to-write-AI-article"
              className="block p-6 border border-gray-100 rounded-xl hover:border-[#1ABC9C] hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#1ABC9C] transition-colors mb-2">
                How to Write an AI assisted Article
              </h3>
              <p className="text-sm text-gray-500">
                A guide on how to write an AI article in detail
              </p>
            </Link>
 
          </div>
        </div>

      </div>
    </div>
  );
}
