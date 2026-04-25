"use client";

// Import all three hooks
import { useSavedArticles } from "../../hooks/useSavedArticles";
import ArticleCard from "./ArticleCard";

export default function MainFeed({ articles }) {
  // 1. Fetch all user-specific context at the top level
  const { savedArticles } = useSavedArticles();
   
  
  if (!articles || articles.length === 0) return <p className="px-8 mt-4 text-gray-500">No articles found.</p>;

  return (
    <div>
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