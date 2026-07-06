"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useSavedArticles } from "../../../../hooks/feeds/useSavedArticles";
import { useInteractedArticles } from "../../../../hooks/feeds/useInteractedArticles";
export default function Saved() {
  const { savedArticles, isLoading: savedLoading } = useSavedArticles();
  const { interactedArticles, isLoading: interactedLoading } = useInteractedArticles();
 
  // Wait for all data to finish loading  
  const isLoading = savedLoading;

  if (isLoading) return <p className="px-8 mt-4">Loading your bookmarks...</p>;

  //check if the list is empty
  if (savedArticles.length === 0) return <p className="px-8 mt-4 text-gray-500">You haven't saved any articles yet.</p>;

  //map articles
  return (
    <section className="px-8 min-w-0">
      <div className=" w-full">
        {savedArticles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            savedArticles={savedArticles}
            interactedArticles={interactedArticles}
           />
        ))}
      </div>
    </section>
  );
}