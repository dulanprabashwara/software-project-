// hooks/useTrending.js
import { useState, useEffect } from "react";

export function useTrending() {
  const [trending, setTrending] = useState([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homefeed/trending`);
        const data = await response.json();
        
        setTrending(Array.isArray(data) ? data : data.trending || []);
      } catch (error) {
        console.error("Trending Fetch error:", error);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []); // Empty dependency array: runs once on mount

  return { trending, isTrendingLoading };
}