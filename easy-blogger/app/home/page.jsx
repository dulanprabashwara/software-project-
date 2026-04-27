"use client";
import { useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import MainFeed from "../../components/article/MainFeed";
import RightFeed from "../../components/article/RightFeed";
import SearchResults from "../../components/search/SearchResults";

function HomeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const isSearching = !!(query && query.trim());
  const scrollRef = useRef(null);

  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "profiles" ? "profiles" : "articles";

  // ✅ OPTIMIZATION: Use a ref to hold our timeout ID
  const scrollTimeout = useRef(null);

  // Helper to save current scroll position safely
  const saveScroll = useCallback(() => {
    // Clear the previous timer if they are still actively scrolling
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    // Set a new timer to save the position after a 100ms pause
    scrollTimeout.current = setTimeout(() => {
      if (scrollRef.current) {
        sessionStorage.setItem("homeScroll", scrollRef.current.scrollTop.toString());
      }
    }, 100);
  }, []);

  // Restore scroll position
  useEffect(() => {
    if (isSearching) return;
    const savedScroll = sessionStorage.getItem("homeScroll");
    if (!savedScroll) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: Number(savedScroll), behavior: "instant" });
        }
      });
    });
  }, [isSearching]);

  // Save scroll on view change and unmount
  useEffect(() => {
    if (isSearching) saveScroll();
  }, [isSearching, saveScroll]);

  useEffect(() => {
    return () => {
      // Ensure we clear the timeout to prevent memory leaks on unmount
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      saveScroll();
    };
  }, [saveScroll]);

  if (isSearching) {
    return <SearchResults query={query.trim()} initialTab={initialTab} />;
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={saveScroll}
        className="p-8 mx-auto h-full overflow-y-auto flex-1"
      >
        <MainFeed />
      </div>

      <div className="hidden lg:block w-80 flex-none h-full overflow-y-auto">
        <RightFeed />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
    </div>
  );
}