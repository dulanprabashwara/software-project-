"use client";

import Link from "next/link";
import { Check, Zap, Info } from "lucide-react";

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header — matches landing page */}
      <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
        <Link
          href="/"
          className="text-2xl font-bold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span className="text-[#111827]">Easy </span>
          <span className="text-[#111827]">Blogger</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/our-story"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors hidden md:block"
          >
            Our story
          </Link>
          <Link
            href="/membership"
            className="text-sm font-medium text-[#111827] hidden md:block"
          >
            Membership
          </Link>
          <Link
            href="/signup"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors hidden md:block"
          >
            Write
          </Link>
          <Link
            href="/login"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-[#111827] text-white text-sm rounded-full hover:bg-[#1f2937] transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-16 text-center">
        <h1
          className="text-5xl md:text-7xl font-bold text-[#111827] leading-tight tracking-tight mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Fuel great thinking.
        </h1>
        <p className="text-lg text-[#6B7280] max-w-xl mx-auto leading-relaxed">
          Become a member to enjoy unlimited access to everything on Easy
          Blogger — and directly support the writers you read most.
        </p>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12">
        <div className="border-t border-[#E5E7EB]"></div>
      </div>

      {/* Pricing Section — same cards as upgrade page */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#111827] mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Choose Your Plan
          </h2>
          <p className="text-[#6B7280] text-base">
            Unlock powerful tools to write, grow, and monetize your content.
          </p>
        </div>

        {/* Pricing Cards — identical to upgrade page */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan Card */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-[#111827] mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#111827]">$0</span>
              <span className="text-[#6B7280] text-base">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" />
                <span className="text-[#6B7280] text-sm">
                  Basic writing tools
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" />
                <span className="text-[#6B7280] text-sm">
                  Limited analytics (7 days)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" />
                <span className="text-[#6B7280] text-sm">
                  3 public posts per month
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" />
                <span className="text-[#6B7280] text-sm">
                  Community access
                </span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="block w-full py-3 px-6 border-2 border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-colors text-center"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Plan Card */}
          <div className="bg-white border-2 border-[#1ABC9C] rounded-2xl p-8 relative">
            {/* Most Popular Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#1ABC9C] text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-[#111827]">Premium</h3>
              <Zap className="w-6 h-6 text-[#FBBF24] fill-[#FBBF24]" />
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-[#111827]">$9.99</span>
              <span className="text-[#6B7280] text-base">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 shrink-0" />
                <span className="text-[#111827] text-sm font-medium">
                  Access to AI Writer
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 shrink-0" />
                <span className="text-[#111827] text-sm font-medium">
                  Detailed Analytics & Insights
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 shrink-0" />
                <span className="text-[#111827] text-sm font-medium">
                  Unlimited Posts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-[#111827] text-sm font-medium">
                    Verified badge on profile
                  </span>
                  <Info className="w-4 h-4 text-[#6B7280]" />
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#1ABC9C] mt-0.5 shrink-0" />
                <span className="text-[#111827] text-sm font-medium">
                  Priority support
                </span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="block w-full py-3 px-6 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-xl text-sm font-medium transition-colors text-center"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-xs text-[#9CA3AF]">
            Prices in USD. Cancel anytime.{" "}
            <a href="#" className="hover:text-[#6B7280] transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12">
        <div className="border-t border-[#E5E7EB]"></div>
      </div>

      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-[#111827] mb-12"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Why members love
          <br />
          Easy Blogger
        </h2>

        <div className="space-y-0">
          <div className="border-t border-[#E5E7EB] py-10 grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
            <h3
              className="text-xl font-bold text-[#111827]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Unlimited reading
            </h3>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Enjoy unlimited access to every story in our library. No paywalls,
              no interruptions — just quality content from writers who care about
              their craft. Dive deep into any topic that catches your eye.
            </p>
          </div>

          <div className="border-t border-[#E5E7EB] py-10 grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
            <h3
              className="text-xl font-bold text-[#111827]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Support writers directly
            </h3>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Your membership directly supports the writers whose work you
              enjoy. The more you engage with a story, the more the author
              earns. It's a model built on quality, not clicks.
            </p>
          </div>

          <div className="border-t border-[#E5E7EB] py-10 grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
            <h3
              className="text-xl font-bold text-[#111827]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              AI-powered tools
            </h3>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Premium members get exclusive access to our integrated AI
              assistant. Draft articles, generate tags, polish your writing, and
              publish faster than ever before — all without leaving the editor.
            </p>
          </div>

          <div className="border-t border-b border-[#E5E7EB] py-10 grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
            <h3
              className="text-xl font-bold text-[#111827]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Beautiful, distraction-free
            </h3>
            <p className="text-base text-[#6B7280] leading-relaxed">
              No ads. No pop-ups. No algorithmic tricks. Just you and the
              stories that matter. Read in a clean, thoughtful environment
              designed for focus.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#F9FAFB] py-20 text-center">
        <h2
          className="text-3xl md:text-4xl font-bold text-[#111827] mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Read without limits.
        </h2>
        <p className="text-base text-[#6B7280] mb-8 max-w-md mx-auto">
          Join a community of curious minds. Start your membership today.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white text-base font-medium rounded-full hover:scale-105 transition-all duration-300"
        >
          Get started
        </Link>
      </section>

      {/* Divider */}
      <div className="w-full border-t border-[#E5E7EB]"></div>

      {/* Footer — matches landing page */}
      <footer className="w-full py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-[#6B7280]">
          <Link
            href="/"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Home
          </Link>
          <Link
            href="/our-story"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Our story
          </Link>
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
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
