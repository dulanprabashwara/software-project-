"use client";

import { useEffect, useState } from "react";
import PublishedArticleCard from "../../../../components/article/PublishedArticleCard";
import { getMyPublishedArticles } from "../../../../lib/articles/api";
import { useSavedList } from "../../../../hooks/useSavedArticles";


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
    <section className="px-8 min-w-0">
      <div className="max-w-3xl w-full">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading published articles...</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500">
            You have not published any articles yet.
          </p>
        ) : (
          articles.map((article) => (
            <PublishedArticleCard key={article.id} 
            article={article}
            savedArticles={savedList}
            />
          ))
        )}
      </div>
    </section>
  );
}