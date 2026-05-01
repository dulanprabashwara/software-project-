import { useState, useEffect } from "react";
import { getTrendingTitlesApi } from "../app/api/trending.api";

let cachedTrendingTitles = null; // Renamed to avoid clashes

export function useTrending() {
  const [trending, setTrending] = useState(cachedTrendingTitles || []);
  const [isTrendingLoading, setIsTrendingLoading] = useState(!cachedTrendingTitles);

  useEffect(() => {
    if (cachedTrendingTitles) {
      setTrending(cachedTrendingTitles);
      setIsTrendingLoading(false);
      return;
    }

    const fetchTrending = async () => {
      setIsTrendingLoading(true);
      try {
        const result = await getTrendingTitlesApi();
        cachedTrendingTitles = result;
        setTrending(result);
      } catch (error) {
        console.error("Trending Titles Fetch error:", error);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { trending, isTrendingLoading };
}