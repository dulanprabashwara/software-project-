//get the popular topics through tags
import { useState, useEffect } from "react";
import { api } from "../lib/api"

export function usePopularTags(limit = 10) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const data = await api.getPopularTags(limit); //apii call
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