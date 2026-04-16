"use client";

import Link from "next/link";

export default function OurStoryPage() {
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
            className="text-sm font-medium text-[#111827] hidden md:block"
          >
            Our story
          </Link>
          <Link
            href="/membership"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors hidden md:block"
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
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-16">
        <h1
          className="text-5xl md:text-7xl font-bold text-[#111827] leading-tight tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Everyone has
          <br />a story to tell.
        </h1>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12">
        <div className="border-t border-[#E5E7EB]"></div>
      </div>

      {/* Mission Section */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p
              className="text-xl md:text-2xl leading-relaxed text-[#374151]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Easy Blogger is a home for human stories and ideas. Here, anyone
              can share insightful perspectives, useful knowledge, and life
              wisdom with the world—without having to build a mailing list or a
              following first.
            </p>
          </div>
          <div>
            <p
              className="text-xl md:text-2xl leading-relaxed text-[#374151]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              The internet is noisy and chaotic; Easy Blogger is quiet yet full
              of insight. It's simple, beautiful, collaborative, and helps you
              find the right audience for whatever you have to say.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12">
        <div className="border-t border-[#E5E7EB]"></div>
      </div>

      {/* Beliefs Section */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-[#111827] mb-12"
          style={{ fontFamily: "Georgia, serif" }}
        >
          We believe in
        </h2>

        <div className="space-y-0">
          {/* Belief Item 1 */}
          <div className="border-t border-[#E5E7EB] py-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h3
                  className="text-xl md:text-2xl font-bold text-[#111827] mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Words matter.
                </h3>
                <p className="text-[#6B7280] text-base max-w-2xl leading-relaxed">
                  We believe that what you read and write matters. Words can
                  divide or empower us, inspire or discourage us. In a world
                  where the most sensational and surface-level stories often win,
                  we're building a system that rewards depth, nuance, and time
                  well spent.
                </p>
              </div>
              <span
                className="text-[#E5E7EB] text-5xl font-bold mt-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                01
              </span>
            </div>
          </div>

          {/* Belief Item 2 */}
          <div className="border-t border-[#E5E7EB] py-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h3
                  className="text-xl md:text-2xl font-bold text-[#111827] mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Anyone can contribute.
                </h3>
                <p className="text-[#6B7280] text-base max-w-2xl leading-relaxed">
                  We've built a platform where anyone can participate. Someone's
                  ability to contribute valuable ideas doesn't depend on who they
                  are or where they come from. If you've got a perspective worth
                  sharing, you have a place here.
                </p>
              </div>
              <span
                className="text-[#E5E7EB] text-5xl font-bold mt-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                02
              </span>
            </div>
          </div>

          {/* Belief Item 3 */}
          <div className="border-t border-[#E5E7EB] py-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h3
                  className="text-xl md:text-2xl font-bold text-[#111827] mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Readers deserve quality.
                </h3>
                <p className="text-[#6B7280] text-base max-w-2xl leading-relaxed">
                  We measure success not by clicks or views, but by time
                  meaningfully spent. Our model aligns the interests of writers
                  and readers, creating a virtuous cycle of high-quality content.
                </p>
              </div>
              <span
                className="text-[#E5E7EB] text-5xl font-bold mt-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                03
              </span>
            </div>
          </div>

          {/* Belief Item 4 */}
          <div className="border-t border-b border-[#E5E7EB] py-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h3
                  className="text-xl md:text-2xl font-bold text-[#111827] mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Ideas should spread.
                </h3>
                <p className="text-[#6B7280] text-base max-w-2xl leading-relaxed">
                  Great ideas can come from anywhere. We're building tools and
                  surfaces that help good ideas find an audience, and help
                  curious readers discover stories they won't find anywhere else.
                </p>
              </div>
              <span
                className="text-[#E5E7EB] text-5xl font-bold mt-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                04
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Large CTA Links */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 pt-8 pb-4">
        <Link
          href="/signup"
          className="group flex items-center justify-between py-10 border-b border-[#E5E7EB] hover:border-[#111827] transition-colors"
        >
          <h2
            className="text-4xl md:text-6xl font-bold text-[#111827] group-hover:text-[#1ABC9C] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Start reading
          </h2>
          <span className="text-4xl md:text-6xl text-[#E5E7EB] group-hover:text-[#1ABC9C] transition-colors">
            →
          </span>
        </Link>
      </section>

      <section className="w-full max-w-5xl mx-auto px-6 md:px-12 pb-20">
        <Link
          href="/signup"
          className="group flex items-center justify-between py-10 border-b border-[#E5E7EB] hover:border-[#111827] transition-colors"
        >
          <h2
            className="text-4xl md:text-6xl font-bold text-[#111827] group-hover:text-[#1ABC9C] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Start writing
          </h2>
          <span className="text-4xl md:text-6xl text-[#E5E7EB] group-hover:text-[#1ABC9C] transition-colors">
            →
          </span>
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
            href="/membership"
            className="hover:text-[#111827] hover:underline transition-colors"
          >
            Membership
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
