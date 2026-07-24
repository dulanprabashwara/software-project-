import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/context/AuthContext"; 
import { api } from "../../lib/api"

const articleLimit = 10;

export function useReadHistory() {
  const { user, profileLoading } = useAuth();
  const [readHistory, setReadHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  //Initial Load
  useEffect(() => {
    if (profileLoading || !user) {
      if (!user && !profileLoading) {
        setReadHistory([]);
        setIsLoading(false);
      }
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const token = await user.getIdToken();
        const data = await api.getReadHistory(token, 1);
        setReadHistory(data);
        setPage(2);
        setHasMore(data.length === articleLimit);
      } catch (error) {
        console.error("Hook Error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [user, profileLoading]); 

  // Load More (Triggered by Scrolling)
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || isLoading || !user) return;

    setIsFetchingMore(true);
    try {
      const token = await user.getIdToken();
      const nextBatch = await api.getReadHistory(token, page);

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setReadHistory((prev) => [...prev, ...nextBatch]);
        setPage((prevPage) => prevPage + 1);
        setHasMore(nextBatch.length === articleLimit);
      }
    } catch (error) {
      console.error("Load More Error:", error.message);
    } finally {
      setIsFetchingMore(false);
    }
  }, [page, isFetchingMore, hasMore, isLoading, user]);

  return { readHistory, isLoading, isFetchingMore, hasMore, loadMore };
}