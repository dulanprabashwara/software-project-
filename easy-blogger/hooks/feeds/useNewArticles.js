import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/context/AuthContext";
 import { api } from "../../lib/api"

// Cache an object now: { articles: [...], page: 3, hasMore: true }
  const articleCache = {};

export function useNewArticles() {
  const { user, profileLoading } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const articleLimit =5;

  //Initial Load
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

    //fetch the forst set of articles
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const token = user ? await user.getIdToken() : null;
        const data = await api.getNewFeed(1, token);
        const initialBatch = Array.isArray(data) ? data : data.articles || [];

        const isMore = initialBatch.length === articleLimit;
        
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

  // 2. Load More (Triggered by Scrolling)
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || isLoading) return;

    setIsFetchingMore(true);
    try {
      const token = user ? await user.getIdToken() : null;
      const data = await api.getNewFeed(page, token);
      const nextBatch = Array.isArray(data) ? data : data.articles || [];
      if (nextBatch.length === 0) {
        setHasMore(false);
        // Update cache
        const cacheKey = user ? user.uid : "guest";
        if (articleCache[cacheKey]) articleCache[cacheKey].hasMore = false;
      } else {
        setArticles((prev) => {
          const combined = [...prev, ...nextBatch];
          
          // Update cache with the new list
          const cacheKey = user ? user.uid : "guest";
          articleCache[cacheKey] = { articles: combined, page: page + 1, hasMore: nextBatch.length === articleLimit };
          
          return combined;
        });
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Load More Error:", error.message);
    } finally {
      setIsFetchingMore(false);
    }
  },[page, isFetchingMore, hasMore, isLoading, user]);

  return { articles, isLoading, isFetchingMore, hasMore,  loadMore };
}