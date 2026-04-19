// hooks/useMainArticles.js
import { useState, useEffect } from "react";

export function useMainArticles(query) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homefeed/main`);
        const data = await response.json();
        
        // Safety check to ensure we always set an array
        setArticles(Array.isArray(data) ? data : data.articles || []);
      } catch (error) {
        console.error("Main Feed Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!query) fetchArticles();
  }, [query]);

  return { articles, isLoading };
}