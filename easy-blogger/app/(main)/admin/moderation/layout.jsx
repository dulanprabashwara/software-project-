"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ModerationLayout({ children }) {
  const pathname = usePathname(); // "Is the user on /queue or /offers?"

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Moderation Dashboard</h1>

      {/* --- THE MODE SWITCHER (Tabs) --- */}
      <div className="tabs tabs-boxed mb-8 bg-base-200 w-fit">
        <Link 
          href="/admin/moderation/queue" 
          className={`tab ${pathname.includes('queue') ? 'tab-active' : ''}`}
        >
          Moderation Queue
        </Link>
        <Link 
          href="/admin/moderation/offers" 
          className={`tab ${pathname.includes('offers') ? 'tab-active' : ''}`}
        >
          Manage Offers
        </Link>
      </div>

      {/* --- THE PAGE CONTENT LOADS HERE --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        {children}
      </div>
    </div>
  );
}