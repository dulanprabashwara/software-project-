 "use client";

import { useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";

export default function layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
     <div className="h-screen overflow-hidden bg-white flex flex-col">
        {/* Header */}
        <div className="h-16 shrink-0">
          <Header onToggleSidebar={() => setSidebarOpen((p) => !p)} />
        </div>

        {/* Main Area */}
        <main
          className={`h-screen     overflow-hidden transition-[margin] duration-500 ease-in-out ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
        >
          <Sidebar isOpen={sidebarOpen} />

          {/* Injected Page Content */}
          {children}
        </main>
    </div>
     
         
      
  );
}
