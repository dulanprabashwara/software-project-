import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/app/context/AuthContext"; 
import { getPublishedArticlesApi } from "@/api/userHistory.api";

export function usePublishedArticles() {
  const { user, profileLoading } = useAuth();
  const [publishedArticles, setPublishedArticles] = useState([]); // Fixed state name
  const [isLoading, setIsLoading] = useState(true);

  const fetchPublishedArticles = useCallback(async () => {
    if (!user) {
      setPublishedArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken(); 
      const data = await getPublishedArticlesApi(token);
      setPublishedArticles(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    fetchPublishedArticles(); // Fixed function call
  }, [profileLoading, fetchPublishedArticles]); // Fixed dependency

  // Fixed return statement variables
  return { publishedArticles, isLoading, refetch: fetchPublishedArticles }; 
}