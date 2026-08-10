"use client";

import { useEffect, useState } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { getMyScheduledArticles } from "../../../../lib/articles/api";

export default function Scheduled() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getMyScheduledArticles(1, 20);
        setArticles(response?.data || []);
      } catch (error) {
        console.error("Failed to load scheduled articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadArticles();
  }, []);

  return (
    <section className="px-8 min-w-0">
      <div className="w-full">
        {isLoading ? (
          <p className="text-sm text-gray-500 py-6">Loading scheduled articles...</p>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-base font-medium">You have not scheduled any articles yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              When you schedule an article to publish later, it will appear here.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard 
            key={article.id} 
            article={article} />
          ))
        )}
      </div>
    </section>
  );
}