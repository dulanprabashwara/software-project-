// Landing page for Easy Blogger
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
        {/* Logo */}
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span className="text-[#111827]">Easy </span>
          <span className="text-[#111827]">Blogger</span>
        </h1>

        {/* Navigation */}
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
            href="/signup"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors hidden md:block"
          >
            Write
          </a>
          <a
            href="/login"
            className="text-sm text-[#6B7280] hover:text-[#000000] transition-colors"
          >
            Sign in
          </a>
          <a
            href="/home"
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
              className="text-6xl md:text-7xl lg:text-8xl font-serif leading-tight tracking-tight text-[#111827] animate-fade-in-up"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Human
              <br />
              stories &<br />
              ideas
            </h2>
            <p className="mt-8 text-lg md:text-xl text-[#374151] max-w-md animate-fade-in-up animation-delay-200">
              A place to read, write, and deepen your understanding
            </p>
            <a
              href="/signup"
              className="inline-block mt-8 mb-16 px-6 py-3 bg-[#111827] text-white text-base rounded-full hover:bg-[#1f2937] hover:scale-105 transition-all duration-300 w-fit animate-fade-in-up animation-delay-400"
            >
              Start reading
            </a>
          </div>

          {/* Vertical Divider Line */}
          <div className="hidden md:block w-px bg-[#E5E7EB] self-stretch"></div>

          {/* Right Illustration */}
          <div className="flex-1 relative hidden md:block pl-8 overflow-visible">
            <div className="relative w-full h-[500px]">
              {/* Circle outline with diagonal line - centered left area */}
              <svg
                className="absolute top-24 left-8 w-48 h-48 animate-spin-slow"
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

              {/* Light blue parallelogram/triangle shape */}
              <svg
                className="absolute top-32 left-20 w-80 h-72 z-0 animate-float"
                viewBox="0 0 320 288"
              >
                <polygon points="60,0 320,120 260,288 0,168" fill="#DBEAFE" />
              </svg>

              {/* Large teal circle - top right with bounce animation */}
              <div className="absolute top-8 right-0 w-52 h-52 rounded-full bg-[#1ABC9C] z-20 animate-bounce"></div>

              {/* Blue rectangle - right side */}
              <div className="absolute top-48 -right-12 w-64 h-44 bg-[#3B82F6] z-30 hover:scale-105 transition-transform duration-300"></div>

              {/* Teal rectangle at bottom right - extends to edge */}
              <div className="absolute bottom-0 -right-12 w-72 h-64 bg-[#1ABC9C] z-30 animate-pulse-slow"></div>

              {/* Wave/curve shape inside blue rectangle */}
              <svg
                className="absolute top-52 -right-12 w-64 h-40 z-40"
                viewBox="0 0 256 160"
              >
                <path
                  d="M0 80 Q64 20 128 80 T256 80 L256 160 L0 160 Z"
                  fill="#1ABC9C"
                />
              </svg>

              {/* Small light blue rectangle inside teal at bottom */}
              <div className="absolute bottom-16 right-8 w-28 h-24 bg-[#60A5FA] z-50 animate-float-delayed"></div>
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
    </div>
  );
}
