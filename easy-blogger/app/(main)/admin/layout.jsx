"use client";
import { useState, useEffect } from "react";
import Header from "../../../components/layout/Header";
import AdminSidebar from "../../../components/admin/AdminSidebar";

import { auth } from "../../../lib/firebase";
import { api } from "../../../lib/api";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="grid grid-rows-[auto,1fr] h-screen w-full bg-gray-100 overflow-hidden">

      {/*Header*/}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex overflow-hidden">

        {/* SIDEBAR WRAPPER */}
        <div
          className={`transition-all duration-300 ease-in-out bg-gray-900 overflow-hidden shrink-0 ${isSidebarOpen ? "w-64" : "w-0"
            }`}
        >
          <AdminSidebar />
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-white transition-all duration-300">
          <div className="min-h-full block">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}