import { useState, useEffect } from "react";
import { getTrendingArticlesApi } from "../app/api/trending.api";

let cachedTrendingArticles = null; // Renamed to avoid clashes

export function useTrendingArticles() {
  const [trending, setTrending] = useState(cachedTrendingArticles || []);
  const [isTrendingLoading, setIsTrendingLoading] = useState(!cachedTrendingArticles);

  useEffect(() => {
    if (cachedTrendingArticles) {
      setTrending(cachedTrendingArticles);
      setIsTrendingLoading(false);
      return;
    }

    const fetchTrending = async () => {
      setIsTrendingLoading(true);
      try {
        const result = await getTrendingArticlesApi();
        cachedTrendingArticles = result;
        setTrending(result);
      } catch (error) {
        console.error("Trending Articles Fetch error:", error);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { trending, isTrendingLoading };
}