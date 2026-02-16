"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ModerationLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {children}
    </div>
  );
}