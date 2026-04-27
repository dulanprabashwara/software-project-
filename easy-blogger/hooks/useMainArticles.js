import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext";
import { getMainFeedApi } from "../app/api/homefeed.api";

// Cache an object now: { articles: [...], page: 3, hasMore: true }
const articleCache = {};

export function useMainArticles() {
  const { user, profileLoading } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    if (profileLoading) return;

    const cacheKey = user ? user.uid : "guest";

    // Restore from cache if they navigated away and came back
    if (articleCache[cacheKey]) {
      setArticles(articleCache[cacheKey].articles);
      setPage(articleCache[cacheKey].page);
      setHasMore(articleCache[cacheKey].hasMore);
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const token = user ? await user.getIdToken() : null;
        const initialBatch = await getMainFeedApi(1, token);

        const isMore = initialBatch.length === 10;
        
        setArticles(initialBatch);
        setPage(2);
        setHasMore(isMore);

        // Save to cache
        articleCache[cacheKey] = { articles: initialBatch, page: 2, hasMore: isMore };
      } catch (error) {
        console.error("Hook Error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [user, profileLoading]); 

  // 2. Load More (Triggered by Scroll)
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || isLoading) return;

    setIsFetchingMore(true);
    try {
      const token = user ? await user.getIdToken() : null;
      const nextBatch = await getMainFeedApi(page, token);

      if (nextBatch.length === 0) {
        setHasMore(false);
        // Update cache
        const cacheKey = user ? user.uid : "guest";
        if (articleCache[cacheKey]) articleCache[cacheKey].hasMore = false;
      } else {
        setArticles((prev) => {
          const combined = [...prev, ...nextBatch];
          
          // Update cache with the new massive list
          const cacheKey = user ? user.uid : "guest";
          articleCache[cacheKey] = { articles: combined, page: page + 1, hasMore: nextBatch.length === 10 };
          
          return combined;
        });
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Load More Error:", error.message);
    } finally {
      setIsFetchingMore(false);
    }
  }, [page, isFetchingMore, hasMore, isLoading, user]);

  return { articles, isLoading, isFetchingMore, hasMore, loadMore };
}