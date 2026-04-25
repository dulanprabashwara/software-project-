import { useState, useEffect } from "react";

export function usePopularTags(limit = 10) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/popularTopics?limit=${limit}`);
        const json = await res.json();

        if (json.success) {
          setTags(json.data);
        } else {
          throw new Error(json.message);
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch popular tags:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [limit]);

  return { tags, isLoading, error };
}