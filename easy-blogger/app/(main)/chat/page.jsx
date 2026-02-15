"use client";

import ChatInterface from "../../../components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 overflow-hidden p-4">
      <ChatInterface />
    </div>
  );
}
