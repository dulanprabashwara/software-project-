//easy-blogger\app\(main)\layout.jsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";

import { SocketProvider } from "../context/SocketContext";

// Layout for the main app section
export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if the user is currently navigating the admin panel
  const isAdminMode = pathname?.startsWith("/admin");

  return (
    <SocketProvider>
      {isAdminMode ? (
        /* ADMIN MODE: Completely remove the user-side layout wrappers 
           so the AdminLayout can take full screen control */
        children
      ) : (
      <div className="h-screen overflow-hidden bg-white">
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} />

        {/* Main content with sidebar offset */}
        <main
          className={`h-[calc(100vh-64px)] overflow-y-auto mt-16 transition-all duration-600 ease-in-out ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
        >
          {children}
        </main>
      </div>
      )}
    </SocketProvider>
  );
}
