// Top navigation header component for the app layout
export default function Header({ onToggleSidebar }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#E5E7EB] z-50 h-16">
      <div className="h-full max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
          >
            <svg
              className="w-5 h-5 text-[#111827]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <span className="text-[#1ABC9C]">Easy </span>
            <span className="text-[#1ABC9C]">Blogger</span>
          </h1>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search stories, topics, and people..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-[#F8FAFC] border border-[#E5E7EB] rounded-full focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent placeholder-[#6B7280] transition-all duration-150"
            />
          </div>
        </div>

        {/* Right: Write button + Notifications + Avatar */}
        <div className="flex items-center gap-4">
          {/* Write button */}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors duration-150">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Write
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-[#F8FAFC] rounded-full transition-colors duration-150">
            <svg
              className="w-6 h-6 text-[#6B7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full"></span>
          </button>

          {/* User avatar */}
          <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E5E7EB] hover:border-[#1ABC9C] transition-colors duration-150">
            <img
              src="https://i.pravatar.cc/150?img=47"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
