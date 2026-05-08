"use client";

import { useFollowingArticles } from "../../hooks/feeds/useFollowingFeed";
import { useSavedArticles } from "../../hooks/feeds/useSavedArticles";
import ArticleCard from "./ArticleCard";
import InfiniteScroll from "../ui/InfiniteScroll"; // Adjust path as needed
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FollowingFeed() {
  const { articles, isLoading, isFetchingMore, hasMore, loadMore } = useFollowingArticles();
  const { savedArticles } = useSavedArticles();
  const router = useRouter();

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
return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded bg-white p-6 text-center shadow-xl">
        <h3 className="text-lg font-bold text-red-600">No Articles</h3>
        <p className="mt-2 text-sm text--500">
          Follow authors to see their articles here.
        </p>
        
        <button
           className="mt-5 w-full rounded bg-yellow-500 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600 cursor-pointer"
           onClick={()=>{
            router.push('/home')
            window.location.reload()

           }}
        >
          OK
        </button>
      </div>
    </div>
  );  }

  return (
    <InfiniteScroll 
      loadMore={loadMore} 
      hasMore={hasMore} 
      isFetchingMore={isFetchingMore}
      endMessage="You've reached the end of your feed."
    >
      <div className="space-y-4 pb-10">
        {articles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article}
            savedArticles={savedArticles}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
}