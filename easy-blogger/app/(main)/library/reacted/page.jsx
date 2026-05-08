"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";
// Import the other two hooks so the cards display correctly
import { useInteractedArticles } from "../../../../hooks/feeds/useInteractedArticles";
 
export default function Saved() {
  const { savedList, isLoading: savedLoading } = useSavedList();
  const { interactedArticles, isLoading: interactedLoading } = useInteractedArticles();
 
  // Wait for all data to finish 
  const isLoading = savedLoading || interactedLoading;

  if (isLoading) return <p className="px-8 mt-4">Loading your interactions...</p>;

  if (interactedArticles.length === 0) return <div><p className="px-8 mt-4 text-gray-500">You haven't Rated or Commented any article.</p></div>;

  //map articles
  return (
    <section className="px-8 min-w-0">
      <div className= "w-full">
        {interactedArticles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            savedArticles={savedList}
            interactedArticles={interactedArticles}
           />
        ))}
      </div>
    </section>
  );
}