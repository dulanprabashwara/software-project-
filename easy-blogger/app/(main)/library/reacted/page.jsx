"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useInteractedArticles } from "../../../../hooks/useInteractedArticles"; 

export default function Reacted() {
  const { interactedArticles, isLoading } = useInteractedArticles();

  if (isLoading) {
    return <div className="px-8 mt-4">Loading articles...</div>;
  }

  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl w-full">
        {interactedArticles.length > 0 ? (
          interactedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <p className="mt-4 text-gray-500">No interacted articles found.</p>
        )}
      </div>
    </section>
  );
}