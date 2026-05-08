import { useState, useEffect } from "react";
import { api } from "../lib/api"

 
export function useTrending() {
  const [trending, setTrending] = useState([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);

  useEffect(() => {
     

    const fetchTrending = async () => {
      setIsTrendingLoading(true);
      try {
        const result = await api.getTrendingTitles();
        setTrending(result);
      } catch (error) {
        console.error("Trending Articles Fetch error:", error);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { trending, isTrendingLoading };
}