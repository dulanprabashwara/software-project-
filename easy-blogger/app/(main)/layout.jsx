"use client";

import { useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";

// Layout for the main app section
export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className=" h-screen bg-white  ">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      {/* Main content with sidebar offset */}
      <main
        className={` h-[calc(100vh-64px)] mt-16 transition-all duration-600 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
