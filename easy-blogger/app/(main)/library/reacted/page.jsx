"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";
// Import the other two hooks so the cards display correctly
import { useInteractedArticles } from "../../../../hooks/feeds/useInteractedArticles";
import InfiniteScroll from "../../../../components/ui/InfiniteScroll";
import { Loader2 } from "lucide-react";

export default function Reacted() {
  const { savedList, isLoading: savedLoading } = useSavedList();
  const { interactedArticles, isLoading: interactedLoading, isFetchingMore, hasMore, loadMore } = useInteractedArticles();
 
  // Wait for all data to finish 
  const isLoading = savedLoading || interactedLoading;

  if (isLoading) return <p className="px-8 mt-4"><Loader2 className="inline w-4 h-4 animate-spin mr-2 text-teal-500" />Loading your interactions...</p>;

  if (interactedArticles.length === 0) return <div><p className="px-8 mt-4 text-gray-500">You haven't Rated or Commented any article.</p></div>;

  //map articles
  return (
    <section className="px-8 min-w-0">
      <InfiniteScroll
        loadMore={loadMore}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        endMessage="You've reached the end of your interactions."
      >
        <div className="w-full">
          {interactedArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              savedArticles={savedList}
              interactedArticles={interactedArticles}
             />
          ))}
        </div>
      </InfiniteScroll>
    </section>
  );
}