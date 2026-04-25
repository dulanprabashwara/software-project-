"use client";

import { useMainArticles } from "../../hooks/useMainArticles";
import { useSavedArticles } from "../../hooks/useSavedArticles";
import ArticleCard from "./ArticleCard";
import { Loader2 } from "lucide-react";

export default function MainFeed() {
  const { articles, isLoading } = useMainArticles();
  const { savedArticles } = useSavedArticles();

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return <p className="mt-4 text-gray-500">No articles found.</p>;
  }

  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <ArticleCard 
          key={article.id} 
          article={article}
          savedArticles={savedArticles}
        />
      ))}
    </div>
  );
}