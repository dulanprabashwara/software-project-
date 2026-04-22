import { useState, useEffect } from "react";
import { useAuth } from "../app/context/AuthContext"; // Adjust path as needed

// Cache by auth state to prevent serving guest data to logged-in users
const articleCache = {};

export function useMainArticles() {
  const { user, profileLoading } = useAuth();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Wait until Firebase resolves the auth state
    if (profileLoading) return;

    // 2. Determine cache key based on auth state
    const cacheKey = user ? user.uid : "guest";

    if (articleCache[cacheKey]) {
      setArticles(articleCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const headers = {};

        // 3. Attach token if the user is authenticated
        if (user) {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/homefeed/main`,
          { headers }
        );

        const data = await res.json();
        const result = Array.isArray(data) ? data : data.articles || [];

        // 4. Save to the specific cache key
        articleCache[cacheKey] = result;
        setArticles(result);
      } catch (error) {
        console.error("Failed to fetch main articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, profileLoading]); // Refetch automatically when user logs in/out

  return { articles, isLoading };
}