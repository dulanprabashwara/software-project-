import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 

export function useArticleRatings() {
  const { user, profileLoading } = useAuth();
  const [articleRatings, setArticleRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticleRatings = useCallback(async () => {
    if (!user) {
      setArticleRatings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      // Adjust the endpoint if your backend route is named differently
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articleRatings`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const json = await res.json();
      
      if (json.success) {
        setArticleRatings(json.data || []);
      } else {
        console.error("Backend error:", json.message);
      }
    } catch (error) {
      console.error("Failed to fetch article ratings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    fetchArticleRatings();
  }, [profileLoading, fetchArticleRatings]);

  return { articleRatings, isLoading, refetch: fetchArticleRatings };
}