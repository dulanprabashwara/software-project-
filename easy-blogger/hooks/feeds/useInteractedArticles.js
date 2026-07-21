import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/context/AuthContext"; 
import { api } from "../../lib/api"

const articleLimit = 10;

 //get interacted articles as a whole (paginated)
export function useInteractedArticles() {
  const { user, profileLoading } = useAuth();
  const [interactedArticles, setInteractedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  //Initial Load
  useEffect(() => {
    if (profileLoading || !user) {
      if (!user && !profileLoading) {
        setInteractedArticles([]);
        setIsLoading(false);
      }
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const token = await user.getIdToken();
        const data = await api.getInteractedArticles(token, 1);
        setInteractedArticles(data);
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
      const nextBatch = await api.getInteractedArticles(token, page);

      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setInteractedArticles((prev) => [...prev, ...nextBatch]);
        setPage((prevPage) => prevPage + 1);
        setHasMore(nextBatch.length === articleLimit);
      }
    } catch (error) {
      console.error("Load More Error:", error.message);
    } finally {
      setIsFetchingMore(false);
    }
  }, [page, isFetchingMore, hasMore, isLoading, user]);

  return { interactedArticles, isLoading, isFetchingMore, hasMore, loadMore };
}


//get the id list of interacted articles
  export function useInteractedList() {
  const { user, profileLoading } = useAuth();
  const [interactedList, setInteractedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInteractedList = useCallback(async () => {
    if (!user) {
      setInteractedList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      
      // FIX 1: Use the correct API function
      const list = await api.getInteractedList(token); 
      const data=list.data;
      setInteractedList(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (profileLoading) return;
    fetchInteractedList();
  }, [profileLoading, fetchInteractedList]);

  return { 
    interactedList, // FIX 2: Return the correct state variable
    isLoading, 
  };
}
