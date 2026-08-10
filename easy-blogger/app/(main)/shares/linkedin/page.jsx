"use client";

import { useEffect, useState } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { getMyPublishedArticles } from "../../../../lib/articles/api";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";

export default function LinkedinShares() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { savedList } = useSavedList();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getMyPublishedArticles(1, 50);
        const allArticles = response?.data || response?.articles || [];

        // Filter articles that have been shared to LinkedIn
        const linkedinArticles = allArticles.filter(
          (article) =>
            article.shareLinkedIn === true ||
            (article.shares &&
              article.shares.some(
                (s) => s.platform && s.platform.toLowerCase().includes("linkedin")
              )) ||
            (article.liPublishJobs && article.liPublishJobs.length > 0)
        );

        setArticles(linkedinArticles);
      } catch (error) {
        console.error("Failed to load LinkedIn shared articles:", error);
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
          <p className="text-sm text-gray-500 py-6">Loading LinkedIn shared articles...</p>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-base font-medium">No articles shared to LinkedIn yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              When you publish an article with LinkedIn sharing enabled, it will appear here.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              savedArticles={savedList}
              showShareBadges={true}
              forcedPlatform="linkedin"
            />
          ))
        )}
      </div>
    </section>
  );
}
