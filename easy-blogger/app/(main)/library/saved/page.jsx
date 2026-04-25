"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useSavedArticles } from "../../../../hooks/useSavedArticles";
import { useInteractedArticles } from "../../../../hooks/useInteractedArticles";
export default function Saved() {
  const { savedArticles, isLoading: savedLoading } = useSavedArticles();
  const { interactedArticles, isLoading: interactedLoading } = useInteractedArticles();
 
  // Wait for all data to finish loading to prevent flashing UI
  const isLoading = savedLoading;

  if (isLoading) return <p className="px-8 mt-4">Loading your bookmarks...</p>;

  if (savedArticles.length === 0) return <p className="px-8 mt-4 text-gray-500">You haven't saved any articles yet.</p>;

  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl w-full">
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