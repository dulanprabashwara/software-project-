"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Sparkles, MessageCircle, Search, PenSquare, Bell, Menu, User, LogOut } from "lucide-react";
import { useSubscription } from "../../app/subscription/SubscriptionContext";

export default function Header({ onToggleSidebar }) {
  const { isPremium } = useSubscription();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);

  const user = { name: "Dulan prabashwara", email: "rji@gmail.com", avatar: "https://i.pravatar.cc/150?img=47", initials: "D" };

  useEffect(() => {
    setMounted(true);
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!mounted) return <header className="h-16 border-b bg-white" />; // Prevents flicker

  const menuItems = [
    { label: "Help", icon: HelpCircle, href: "#", border: true },
    { label: "Messages", icon: MessageCircle, href: "/chat" },
    { 
      label: isPremium ? "Manage Membership" : "Become a Member", 
      icon: Sparkles, 
      href: isPremium ? "/subscription/manage" : "/subscription/upgrade",
      color: "text-amber-600" 
    },
    { label: "Sign out", icon: LogOut, onClick: () => alert("Out!"), border: true, color: "text-red-500" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 bg-white border-b z-50 h-16 px-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={20} /></button>
        <Link href="/home" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#1ABC9C] font-serif">Easy Blogger</h1>
        </Link>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input placeholder="Search..." className="w-full pl-11 pr-4 py-2 bg-gray-50 border rounded-full text-sm outline-none focus:ring-1 ring-[#1ABC9C]" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Link href="/write/choose-method" className="bg-[#1ABC9C] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#17a589]">
          <PenSquare size={16} /> <span className="hidden sm:inline">Write</span>
        </Link>

        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpen(!open)} className={`w-9 h-9 rounded-full border-2 overflow-hidden ${isPremium ? 'border-amber-400' : 'border-transparent'}`}>
            <img src={user.avatar} className="object-cover w-full h-full" alt="User" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b mb-1 text-sm">
                <p className="font-bold truncate">{user.name}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
              
              {menuItems.map((item, i) => (
                <div key={i}>
                  {item.border && <div className="border-t my-1" />}
                  <Link 
                    href={item.href || "#"} 
                    onClick={item.onClick || (() => setOpen(false))}
                    className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 ${item.color || "text-gray-700"}`}
                  >
                    <item.icon size={16} /> {item.label}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}