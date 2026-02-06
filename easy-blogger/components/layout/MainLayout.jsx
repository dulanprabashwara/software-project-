"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import EngagementModal from "../EngagementModal";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);
  const [engagementActiveTab, setEngagementActiveTab] = useState("followers");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        onOpenEngagement={() => setEngagementModalOpen(true)}
      />

      {/* Main content with sidebar offset */}
      <div
        className={`transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-60" : "ml-0"}`}
      >
        {children}
      </div>

      {/* Engagement Modal */}
      <EngagementModal
        isOpen={engagementModalOpen}
        onClose={() => setEngagementModalOpen(false)}
        activeTab={engagementActiveTab}
        setActiveTab={setEngagementActiveTab}
      />
    </>
  );
}
