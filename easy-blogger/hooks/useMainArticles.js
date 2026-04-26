import { useState, useEffect } from "react";
import { useAuth } from "../app/context/AuthContext";
import { getMainFeedApi } from "../app/api/homefeed.api";

const articleCache = {};

export function useMainArticles() {
  const { user, profileLoading } = useAuth();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;

    const cacheKey = user ? user.uid : "guest";

    if (articleCache[cacheKey]) {
      setArticles(articleCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = user ? await user.getIdToken() : null;
        const result = await getMainFeedApi(token);

        articleCache[cacheKey] = result;
        setArticles(result);
      } catch (error) {
        console.error("Hook Error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, profileLoading]); 

  return { articles, isLoading };
}