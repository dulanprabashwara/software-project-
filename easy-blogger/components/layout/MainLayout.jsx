"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      {/* Main content with sidebar offset */}
      <div
        className={` overflow hidden transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-60" : "ml-0"}`}
      >
        {children}
      </div>
    </>
  );
}
