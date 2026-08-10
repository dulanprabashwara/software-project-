"use client";

import { useEffect, useState } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { getMyPublishedArticles } from "../../../../lib/articles/api";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";

export default function WordpressShares() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { savedList } = useSavedList();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getMyPublishedArticles(1, 50);
        const allArticles = response?.data || response?.articles || [];

        // Filter articles that have been shared to WordPress
        const wpArticles = allArticles.filter(
          (article) =>
            article.shareWordPress === true ||
            (article.shares &&
              article.shares.some(
                (s) => s.platform && s.platform.toLowerCase().includes("wordpress")
              )) ||
            (article.wpPublishJobs && article.wpPublishJobs.length > 0)
        );

        setArticles(wpArticles);
      } catch (error) {
        console.error("Failed to load WordPress shared articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadArticles();
  }, []);

  return (
    <section className="px-8 min-w-0 w-full py-4">
      <div className="w-full">
        {isLoading ? (
          <p className="text-sm text-gray-500 py-6">Loading WordPress shared articles...</p>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-base font-medium">No articles shared to WordPress yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              When you connect and publish articles to WordPress, they will appear here.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              savedArticles={savedList}
              showShareBadges={true}
              forcedPlatform="wordpress"
            />
          ))
        )}
      </div>
    </section>
  );
}
