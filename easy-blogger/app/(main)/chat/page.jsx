"use client";

import ChatInterface from "../../../components/chat/ChatInterface";
import Header from "../../../components/layout/Header";
import Sidebar from "../../../components/layout/Sidebar";
import { useState } from "react";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      <div
        className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-0"}`}
      >
        <div className="h-[calc(100vh-64px)] overflow-hidden p-4">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
