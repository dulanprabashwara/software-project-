import { useState, useEffect } from "react";
import { useAuth } from "../../app/context/AuthContext";
import { api } from "../../lib/api";

// Cache just the articles array: { [uid]: [...] }
const articleCache = {};

export function useTopUserArticles() {
  const { user, profileLoading } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait until auth state is determined
    if (profileLoading) return;

    // If there is no logged-in user, they can't have personal top articles.
    // Exit early to prevent 401 Unauthorized errors from your backend.
    if (!user) {
      setArticles([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = user.uid;

    // Restore from cache if they navigated away and came back
    if (articleCache[cacheKey]) {
      setArticles(articleCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    // Fetch the articles
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = await user.getIdToken();
        
        const data = await api.getTopUserArticles(token);
        const fetchedArticles = Array.isArray(data) ? data : data.articles || [];

        setArticles(fetchedArticles);

        // Save to cache
        articleCache[cacheKey] = fetchedArticles;
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