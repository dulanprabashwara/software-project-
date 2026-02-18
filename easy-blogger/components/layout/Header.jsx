"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {HelpCircle,Sparkles,MessageCircle,Search,PenSquare,Bell,Menu,LogOut,BadgeCheck} from "lucide-react";
import { useSubscription } from "../../app/subscription/SubscriptionContext";

export default function Header({ onToggleSidebar }) { //onToggleSidebar is a function passed down
  const {isPremium}  = useSubscription(); //get subscription states

  const [open, setOpen] = useState(false); //user dropdown open or closed
  const [mounted, setMounted] = useState(false); //for good rendering?
  const menuRef = useRef(null); //reference for user-dropdown menu

  //mock user details
  const user = {
    name: "Emma Richardson",
    email: "richardsonem17@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=47",
  };

  
  // Close dropdown when clicking outside (only when open) 9trackes 'open' variable
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => { // 'e' is the mouse event
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDown); //global event listner for mouse press
    return () => document.removeEventListener("mousedown", onDown); //clean up effect. remove mouse listner
  }, [open]);

    //load a skelton if the UI isn't rendered

  const membership = isPremium
    ? { label: "Manage Membership", href: "/subscription/manage" } //set membership states [make object] using 'isPremium'  taken from 'useSubscription' component
    : { label: "Become a Member", href: "/subscription/upgrade" };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white border-b border-[#e5e7eb] px-6 flex items-center justify-between">
      {/* Left stuff (logo, sidebar button)*/}
      <div className="flex items-center gap-4"> {/*left div*/}
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle sidebar" 
        > {/*for screenreaders*/}
          <Menu size={20} /> {/*menu icon from lucide*/}
        </button>

        <Link href="/home" className="flex items-center gap-2">
         <img
              src="/images/easy-blogger-logo.png"
              alt="Easy Blogger Logo"
              className="h-12 w-auto"
            />
          <h1 className="text-2xl font-bold text-[#1ABC9C] font-serif">
            Easy Blogger
          </h1>
        </Link>
      </div>

      {/* Search (md+) */}
      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          placeholder="Search..."
          className="w-full pl-11 pr-4 py-2 bg-gray-50  border border-[#e5e7eb] rounded-full text-sm outline-none focus:ring-1 ring-[#1ABC9C]"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Link
          href="/write/choose-method"
          className="bg-[#1ABC9C] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#17a589]"
        >
          <PenSquare size={16} />
          <span className="hidden sm:inline">Write</span>
        </Link>

        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full" aria-label="Notifications">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}> {/* store a reference to this element*/}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className={`w-9 h-9 rounded-full border-2 overflow-hidden ${
              isPremium ? "border-amber-400" : "border-transparent"
            }`}
            aria-label="User menu"
          >
            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 drop-shadow-md z-10">
                <BadgeCheck className="w-5 h-5 text-[#1ABC9C]" />
              </div>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100">
              <div className={`w-17 h-17 rounded-full border-2 overflow-hidden mx-auto ${isPremium ? "border-amber-400" : "border-transparent" }`}>
                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="px-4 py-2 border-none mb-1 text-sm   mb-0">
                <p className="font-bold truncate">
                 
                  <Link href="./profile">
                   
                    {user.name} 
                     
                  </Link>
                 
                </p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>

              </div>
              

              {/*icon help, message,membership from menulink function*/}

              <div className="border-t border-[#e5e7eb] my-1" />
              <Link
                href="#"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
              >
                <HelpCircle size={16} /> Help
              </Link>

              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
              >
                <MessageCircle size={16} /> Messages
              </Link>

              <Link
                href={membership.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-amber-600"
              >
                <Sparkles size={16} /> {membership.label}
              </Link>

              <div className="border-t border-[#e5e7eb] my-1" />

              <Link href="./login"
                onClick={() => {
                  setOpen(false);
                  alert("Logging out!!");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-red-500"
              >
                <LogOut size={16} /> Sign out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
