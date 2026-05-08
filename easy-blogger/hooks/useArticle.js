// hooks get article details for reading 
import { useState, useEffect } from "react";

export function useArticle(id) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
   console.log("Article read hook triggered with ID:", id);  
  if (!id) {
    console.log("No ID found, skipping fetch.");
    return;
  }

    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articleRead?id=${id}`); //api route
        if (!response.ok) throw new Error("Article not found");
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
        console.error("Fetch article error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { article, isLoading, error };
}