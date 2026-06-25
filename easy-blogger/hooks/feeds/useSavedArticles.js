import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/context/AuthContext"; 
import { api } from "../../lib/api"

const articleLimit = 10;

export function useSavedArticles() {
  const { user, profileLoading } = useAuth(); //get user object
  const [savedArticles, setSavedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  //Initial Load
  useEffect(() => {
    if (profileLoading || !user) {
      if (!user && !profileLoading) {
        setSavedArticles([]);
        setIsLoading(false);
      }
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const token = await user.getIdToken();

        // Call the function to get the saved articles
        const res = await api.getSavedArticles(token, 1);
        const data = res.data;
        setSavedArticles(data);
        setPage(2);
        setHasMore(data.length === articleLimit);
      } catch (error) {
        console.error("Hook Error:", error.message); //get the error 
      } finally {
        setIsLoading(false); //stop loading whatever happens
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
      const res = await api.getSavedArticles(token, page);
      const nextBatch = res.data;

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setSavedArticles((prev) => [...prev, ...nextBatch]);
        setPage((prevPage) => prevPage + 1);
        setHasMore(nextBatch.length === articleLimit);
      }
    } catch (error) {
      console.error("Load More Error:", error.message);
    } finally {
      setIsFetchingMore(false);
    }
  }, [page, isFetchingMore, hasMore, isLoading, user]);

  return { 
    savedArticles, 
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
  };
}

//get only a list of saved article IDs
export function useSavedList() {
  const { user, profileLoading } = useAuth();
  const [savedList, setSavedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedList = useCallback(async () => {
    if (!user) {
      setSavedList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      
      
      const list = await api.getSavedList(token); //api call
      const data=list.data;
      setSavedList(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (profileLoading) return;
    fetchSavedList();
  }, [profileLoading, fetchSavedList]);

  return { 
    savedList, 
    isLoading, 
  };
}