"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

export default function InfiniteScroll({ 
  children, 
  loadMore, 
  hasMore, 
  isFetchingMore, 
  rootMargin = "200px",
  endMessage = "You've reached the end."
}) {
  // 1. Setup the Tripwire
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin,
  });

  // 2. Trigger the fetch automatically
  useEffect(() => {
    if (inView && hasMore && !isFetchingMore) {
      loadMore();
    }
  }, [inView, hasMore, isFetchingMore, loadMore]);

  return (
    <div className="w-full">
      {/* 3. Render whatever list the parent component passes in */}
      {children}

      {/* 4. The Reusable Tripwire Element */}
      <div 
        ref={ref} 
        className="flex justify-center items-center py-6 h-16 w-full"
      >
        {isFetchingMore && (
          <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
        )}
        
        {!hasMore && (
          <p className="text-gray-400 text-sm">
            {endMessage}
          </p>
        )}
      </div>
    </div>
  );
}