"use client";

import { useEffect, useState, useCallback } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { getMyPublishedArticles } from "../../../../lib/articles/api";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";

const PAGE_SIZE = 10;

export default function LinkedinShares() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { savedList } = useSavedList();

  const filterLinkedinArticles = (items) => {
    return items.filter(
      (article) =>
        article.shareLinkedIn === true ||
        (article.shares &&
          article.shares.some(
            (s) => s.platform && s.platform.toLowerCase().includes("linkedin")
          )) ||
        (article.liPublishJobs && article.liPublishJobs.length > 0)
    );
  };

  const loadArticles = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await getMyPublishedArticles(pageNum, PAGE_SIZE);
      const rawArticles = response?.data || response?.articles || [];
      const linkedinArticles = filterLinkedinArticles(rawArticles);

      setArticles((prev) =>
        pageNum === 1 ? linkedinArticles : [...prev, ...linkedinArticles]
      );

      if (rawArticles.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load LinkedIn shared articles:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles(1);
  }, [loadArticles]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      void loadArticles(nextPage);
    }
  };

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
          <>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                savedArticles={savedList}
                showShareBadges={true}
                forcedPlatform="linkedin"
              />
            ))}

            {hasMore && (
              <div className="py-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-full transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? "Loading..." : "Load More Articles"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
