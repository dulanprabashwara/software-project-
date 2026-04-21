"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useSavedArticles } from "../../../../hooks/useSavedArticles";
export default function Saved() {
  const { savedArticles, isLoading } = useSavedArticles();

  if (isLoading) return <p>Loading your bookmarks...</p>;

  if (savedArticles.length === 0) return <p>You haven't saved any articles yet.</p>;
  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl   w-full">
        {savedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
