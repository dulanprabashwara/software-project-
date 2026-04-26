import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 
import { getInteractedArticlesApi } from "../app/api/userInteractions.api";

export function useInteractedArticles() {
  const { user, profileLoading } = useAuth();
  const [interactedArticles, setInteractedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInteractedArticles = useCallback(async () => {
    if (!user) {
      setInteractedArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const data = await getInteractedArticlesApi(token);
      setInteractedArticles(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    fetchInteractedArticles();
  }, [profileLoading, fetchInteractedArticles]);

  return { interactedArticles, isLoading, refetch: fetchInteractedArticles };
}