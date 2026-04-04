"use client";

import { Suspense } from "react";
import ChatInterface from "../../../components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 overflow-hidden p-4">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-gray-400">Loading chat...</div>}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}
