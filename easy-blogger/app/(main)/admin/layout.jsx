"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "../../../components/layout/Header";
import AdminSidebar from "../../../components/admin/AdminSidebar";

import { auth } from "../../../lib/firebase";
import { api } from "../../../lib/api";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Automatically open sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //Auto-close sidebar on mobile when navigating ---
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [usePathname]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          // Silently register the admin device globally across the admin panel
          await api.registerSession(token); 
        } catch (error) {
          console.error("Global session registration failed:", error);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen w-full bg-gray-100 overflow-hidden flex flex-col">

      {/*Header*/}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen}/>

      <div className="flex flex-1 overflow-hidden relative pt-16">

        {/* Mobile Dark Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden top-16"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR WRAPPER */}
        <div
          className={`absolute lg:relative z-50 h-full transition-all duration-300 ease-in-out bg-gray-900 overflow-hidden shrink-0 ${
            isSidebarOpen ? "w-64" : "w-0"
          }`}
        >
          <AdminSidebar />
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-white transition-all duration-300 min-w-0">
          <div className="min-h-full block">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}