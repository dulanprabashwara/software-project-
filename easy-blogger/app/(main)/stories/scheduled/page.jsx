"use client";

import { useEffect, useState } from "react";
import ScheduledArticleCard from "../../../../components/article/ScheduledArticleCard";
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
      <div className="max-w-3xl w-full">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading scheduled articles...</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500">
            You have not scheduled any articles yet.
          </p>
        ) : (
          articles.map((article) => (
            <ScheduledArticleCard key={article.id} article={article} />
          ))
        )}
      </div>
    </section>
  );
}