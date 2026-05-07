"use client";
import { useState } from "react";
import Header from "../../../components/layout/Header";
import AdminSidebar from "../../../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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