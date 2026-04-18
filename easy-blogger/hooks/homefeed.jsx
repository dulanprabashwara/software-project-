import { useState, useEffect } from "react";

export function homefeed(query) {
  const [data, setData] = useState({ articles: [], trending: [], topics: [], usersToFollow: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homefeed`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!query) fetchFeed();
  }, [query]);

  return { data, isLoading };
}