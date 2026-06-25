"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useSavedArticles } from "../../../../hooks/feeds/useSavedArticles";
import { useInteractedArticles } from "../../../../hooks/feeds/useInteractedArticles";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll";
import { Loader2 } from "lucide-react";

export default function Saved() {
  const { savedArticles, isLoading, isFetchingMore, hasMore, loadMore } = useSavedArticles();
  const { interactedArticles, isLoading: interactedLoading } = useInteractedArticles();
 
  // Wait for all data to finish loading  
  if (isLoading) return <p className="px-8 mt-4"><Loader2 className="inline w-4 h-4 animate-spin mr-2 text-teal-500" />Loading your bookmarks...</p>;

  //check if the list is empty
  if (savedArticles.length === 0) return <p className="px-8 mt-4 text-gray-500">You haven't saved any articles yet.</p>;

  //map articles
  return (
    <section className="px-8 min-w-0">
      <InfiniteScroll
        loadMore={loadMore}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        endMessage="You've reached the end of your saved articles."
      >
        <div className="w-full">
          {savedArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              savedArticles={savedArticles}
              interactedArticles={interactedArticles}
             />
          ))}
        </div>
      </InfiniteScroll>
    </section>
  );
}