"use client";

import { Suspense, useEffect } from "react";
import ChatInterface from "../../../components/chat/ChatInterface";

export default function ChatPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  return (
    <div className="h-full min-h-0 box-border bg-gray-50 overflow-hidden p-4">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-gray-400">Loading chat...</div>}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}
