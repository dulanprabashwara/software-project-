"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ModerationLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>
          Moderation
        </h1>
      </div>

      {/* --- TOGGLE SWITCHER --- */}
      <div className="bg-gray-200 p-1 rounded-full w-fit flex mb-6 mx-auto md:mx-0">
        <Link 
          href="/admin/moderation/queue" 
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            pathname.includes('queue') 
            ? 'bg-white text-[#1ABC9C] shadow-sm' 
            : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          Queue
        </Link>
        <Link 
          href="/admin/moderation/offers" 
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            pathname.includes('offers') 
            ? 'bg-white text-[#1ABC9C] shadow-sm' 
            : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          Offers
        </Link>
      </div>

      {/* --- CONTENT --- */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}