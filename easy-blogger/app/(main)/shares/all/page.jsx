"use client";

import { useEffect, useState } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { getMyPublishedArticles } from "../../../../lib/articles/api";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";

export default function AllShares() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { savedList } = useSavedList();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getMyPublishedArticles(1, 50);
        const allArticles = response?.data || response?.articles || [];

        // Filter articles that have been shared to LinkedIn, WordPress, or both
        const sharedArticles = allArticles.filter(
          (article) =>
            article.shareLinkedIn === true ||
            article.shareWordPress === true ||
            (article.shares && article.shares.length > 0) ||
            (article.liPublishJobs && article.liPublishJobs.length > 0) ||
            (article.wpPublishJobs && article.wpPublishJobs.length > 0)
        );

        setArticles(sharedArticles);
      } catch (error) {
        console.error("Failed to load shared articles:", error);
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
          <p className="text-sm text-gray-500 py-6">Loading shared articles...</p>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-base font-medium">No shared articles found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Articles published to social platforms (LinkedIn or WordPress) will appear here.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              savedArticles={savedList}
              showShareBadges={true}
            />
          ))
        )}
      </div>
    </section>
  );
}
