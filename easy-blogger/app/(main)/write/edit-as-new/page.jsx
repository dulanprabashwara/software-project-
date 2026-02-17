"use client";

import { useState } from "react";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((p) => !p);

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="p-8">Edit-as-New page layout</div>
      </main>
    </div>
  );
}

