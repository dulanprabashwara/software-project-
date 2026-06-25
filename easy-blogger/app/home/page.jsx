"use client";
import { useRef, useEffect, useCallback, Suspense,useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import NewFeed from "../../components/article/NewFeed";
import FollowingFeed from "../../components/article/FollowingFeed";
import RightFeed from "../../components/article/RightFeed";
import SearchResults from "../../components/search/SearchResults";

function HomeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const isSearching = !!(query && query.trim());
  const scrollRef = useRef(null);

  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "profiles" ? "profiles" : "articles";
  const [getFeed, setFeed] = useState(1);
  const getFeedRef = useRef(1);
  getFeedRef.current = getFeed;

  //Use a ref to hold our timeout ID
  const scrollTimeout = useRef(null);

  // Helper to save current scroll position safely
  const saveScroll = useCallback(() => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      if (scrollRef.current) {
        sessionStorage.setItem(`homeScroll_${getFeedRef.current}`, scrollRef.current.scrollTop.toString()); 
      }
    }, 100); 
  }, []);

  // Restore scroll position
  useEffect(() => {
    if (isSearching) return;
    const savedScroll = Number(sessionStorage.getItem(`homeScroll_${getFeed}`) || 0);
    if (savedScroll === 0) return;

    let attempts = 0;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: savedScroll, behavior: "instant" });
        if (Math.abs(scrollRef.current.scrollTop - savedScroll) < 5 || attempts > 20) {
          clearInterval(interval);
        }
      }
      attempts++;
    }, 100);

    return () => clearInterval(interval);
  }, [isSearching, getFeed]);

  // Save scroll on search view change
  useEffect(() => {
    if (isSearching) saveScroll();
  }, [isSearching, saveScroll]);

  // Final save on unmount (navigation)
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (scrollRef.current) {
        sessionStorage.setItem(`homeScroll_${getFeedRef.current}`, scrollRef.current.scrollTop.toString());
      }
    };
  }, []);

  // Restore the active tab from sessionStorage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem("homeFeedTab");
    if (savedTab && Number(savedTab) !== getFeedRef.current) {
      setFeed(Number(savedTab));
    }
  }, []);

  const handleTabChange = (newFeed) => {
    if (getFeed === newFeed) return;
    if (scrollRef.current) {
      sessionStorage.setItem(`homeScroll_${getFeed}`, scrollRef.current.scrollTop.toString());
    }
    sessionStorage.setItem("homeFeedTab", newFeed.toString());
    setFeed(newFeed);
  };

  if (isSearching) {
    return <SearchResults query={query.trim()} initialTab={initialTab} />;
  }

  return (
  <div className="flex h-full overflow-hidden">
    
    {/* Center Column: Flex-col keeps header at top, feed scrolling below */}
    <div className="flex flex-col flex-1 h-full border-r border-gray-100">
      
      {/* Follow, NEw header*/}
      <div className="flex w-full border-b border-gray-200 bg-white/90 backdrop-blur z-10">
        <button
          onClick={() => handleTabChange(1)}
          className={`flex-1 py-4 text-sm md:text-base font-semibold transition-all duration-200 hover:bg-gray-50 
            ${getFeed === 1 
              ? "border-b-4 border-[#1abc9c] text-[#1abc9c]" 
              : "text-gray-500 border-b-4 border-transparent"}`}
        >
          New
        </button>
        
        <button
          onClick={() => handleTabChange(2)}
          className={`flex-1 py-4 text-sm md:text-base font-semibold transition-all duration-200 hover:bg-gray-50 
            ${getFeed === 2 
              ? "border-b-4 border-[#1abc9c] text-[#1abc9c]"  
              : "text-gray-500 border-b-4 border-transparent"}`}
        >
          Following
        </button>
      </div>

      {/* SCROLLABLE FEED */}
      <div
        ref={scrollRef}
        onScroll={saveScroll}
        className="p-4 md:p-8 mx-auto w-full h-full overflow-y-auto"
      >
        {getFeed === 1 ? (
          <NewFeed/>
        ) : getFeed === 2 ? (
          <FollowingFeed />
        ) : (
          <h1 className="text-center mt-10 text-gray-500">INVALID Please refresh</h1>
        )}
      </div>

    </div>

    {/* RIGHT SIDEBAR */}
    <div className="hidden lg:block w-80 flex-none h-full overflow-y-auto bg-gray-50/50">
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