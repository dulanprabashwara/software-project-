import { useState, useEffect } from "react";

// Cache persists for the entire SPA session, regardless of who logs in/out
let cachedTrending = null;

export function useTrendingArticles() {
  const [trending, setTrending] = useState(cachedTrending || []);
  const [isTrendingLoading, setIsTrendingLoading] = useState(!cachedTrending);

  useEffect(() => {
    // 1. If we already have the global trending data, skip the fetch
    if (cachedTrending) {
      setTrending(cachedTrending);
      setIsTrendingLoading(false);
      return;
    }

    const fetchTrending = async () => {
      setIsTrendingLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trendingArticles/trendingArticles`);
        const data = await response.json();
        
        const result = Array.isArray(data) ? data : data.trending || [];
        
        // 2. Save it to the global cache
        cachedTrending = result;
        setTrending(result);
      } catch (error) {
        console.error("Trending Fetch error:", error);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []); // Empty array is fine here since it never depends on auth state

  return { trending, isTrendingLoading };
}