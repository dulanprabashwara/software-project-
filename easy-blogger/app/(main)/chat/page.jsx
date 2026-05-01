"use client";

import { Suspense, useEffect } from "react";
import ChatInterface from "../../../components/chat/ChatInterface";
//show loading chat text while the browser is fetching the initial data . It freezes the main browser window from scrolling

export default function ChatPage() {
  useEffect(() => {
    // scroll lock the main browser window on mobile for chat page to prevent pull to refresh
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    // save previous state of scroll properties to restore them when leave the page
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  return (
    // chat page
    <div className="h-full min-h-0 box-border bg-gray-50 overflow-hidden p-4">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-gray-400">
            Loading chat...
          </div>
        }
      >
        <ChatInterface />
      </Suspense>
    </div>
  );
}
