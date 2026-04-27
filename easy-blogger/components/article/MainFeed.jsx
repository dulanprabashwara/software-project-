"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useMainArticles } from "../../hooks/useMainArticles";
import { useSavedList } from "../../hooks/useSavedArticles";
import ArticleCard from "./ArticleCard";
import { Loader2 } from "lucide-react";

export default function MainFeed() {
  // 1. Pull in the new pagination states and functions
  const { articles, isLoading, isFetchingMore, hasMore, loadMore } = useMainArticles();
  const { savedList } = useSavedList();

  // 2. Setup the "Motion Sensor" (Tripwire)
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px", // Triggers the fetch 200px before they hit the bottom
  });

  // 3. Fire the loadMore function when the sensor is tripped
  useEffect(() => {
    console.log("Tripwire Status ->", { inView, hasMore, isLoading, isFetchingMore });
    if (inView && hasMore && !isLoading && !isFetchingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isFetchingMore, loadMore]);

  // Initial full-page loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
      </div>
    );
  }

  // Empty state
  if (!articles || articles.length === 0) {
    return <p className="mt-4 text-gray-500">No articles found.</p>;
  }

  return (
    <div className="space-y-4 pb-10">
      {/* 4. Render the articles normally */}
      {articles.map((article) => (
        <ArticleCard 
          key={article.id} 
          article={article}
          savedArticles={savedList}
        />
      ))}

      {/* 5. The Tripwire Element at the very bottom */}
      <div 
        ref={ref} 
        className="flex justify-center items-center py-6 h-16 w-full"
      >
        {isFetchingMore && (
          <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
        )}
        
        {!hasMore && articles.length > 0 && (
          <p className="text-gray-400 text-sm">
            You've reached the end of the feed.
          </p>
        )}
      </div>
    </div>
  );
}