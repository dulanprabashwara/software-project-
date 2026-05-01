import { useState, useEffect } from "react";
import { getPopularTagsApi } from "../app/api/topics.api";

export function usePopularTags(limit = 10) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const data = await getPopularTagsApi(limit);
        setTags(data);
      } catch (err) {
        setError(err.message);
        console.error("Hook Error:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [limit]);

  return { tags, isLoading, error };
}