"use client";

import { useNewArticles } from "../../hooks/feeds/useNewArticles";
import { useSavedArticles } from "../../hooks/feeds/useSavedArticles";
import ArticleCard from "./ArticleCard";
import InfiniteScroll from "../ui/InfiniteScroll"; // Adjust path as needed
import { Loader2 } from "lucide-react";

export default function MainFeed() {
  const { articles, isLoading, isFetchingMore, hasMore, loadMore } = useNewArticles();
  const { savedArticles } = useSavedArticles();

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
    <InfiniteScroll 
      loadMore={loadMore} 
      hasMore={hasMore} 
      isFetchingMore={isFetchingMore}
      endMessage="You've reached the end of New Article Feed."
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