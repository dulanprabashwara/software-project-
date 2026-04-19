import { useState, useEffect } from "react";

// persists for entire session (SPA lifetime)
let cachedArticles = null;

export function useMainArticles() {
  const [articles, setArticles] = useState(cachedArticles || []);
  const [isLoading, setIsLoading] = useState(!cachedArticles);

  useEffect(() => {
    // ✅ if already cached → NEVER fetch again
    if (cachedArticles) {
      setArticles(cachedArticles);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homefeed/main`
      );

      const data = await res.json();

      const result = Array.isArray(data)
        ? data
        : data.articles || [];

      cachedArticles = result;

      setArticles(result);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return { articles, isLoading };
}