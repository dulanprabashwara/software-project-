"use client";

import { useEffect, useState } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { getMyPublishedArticles } from "../../../../lib/articles/api";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";


export default function Published() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
    const { savedList} = useSavedList();


  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getMyPublishedArticles(1, 20);
        setArticles(response?.data || []);
      } catch (error) {
        console.error("Failed to load published articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadArticles();
  }, []);

  return (
    <section className="px-8 min-w-0 w-full">
      <div className="w-full">
        {isLoading ? (
          <p className="text-sm text-brand-muted py-6">Loading published articles...</p>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-brand-muted">
            <p className="text-base font-medium">You have not published any articles yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              When you publish an article, it will appear here.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.id}
            article={article}
            savedArticles={savedList}
            />
          ))
        )}
      </div>
    </section>
  );
}