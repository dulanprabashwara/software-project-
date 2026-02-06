"use client";

import { useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import EngagementModal from "../../components/EngagementModal";

// Layout for the main app section
export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);
  const [engagementActiveTab, setEngagementActiveTab] = useState("followers");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        onOpenEngagement={() => {
          console.log("Layout: Opening engagement modal");
          setEngagementModalOpen(true);
        }}
      />

      {/* Main content with sidebar offset */}
      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        {children}
      </main>

      {/* Engagement Modal */}
      <EngagementModal
        isOpen={engagementModalOpen}
        onClose={() => setEngagementModalOpen(false)}
        activeTab={engagementActiveTab}
        setActiveTab={setEngagementActiveTab}
      />
    </div>
  );
}
