import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; // Adjust path as needed

export function useSavedArticles() {
  const { user, profileLoading } = useAuth();
  const [savedArticles, setSavedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedArticles = useCallback(async () => {
    // If no user is logged in, they have no saved articles.
    if (!user) {
      setSavedArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saveArticle`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const json = await res.json();
      
      if (json.success) {
        setSavedArticles(json.data || []);
      } else {
        console.error("Backend error:", json.message);
      }
    } catch (error) {
      console.error("Failed to fetch saved articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Re-create function only if the user changes

  useEffect(() => {
    // Wait until Firebase resolves the auth state
    if (profileLoading) return;
    
    fetchSavedArticles();
  }, [profileLoading, fetchSavedArticles]);

  // We return 'refetch' so you can manually trigger an update 
  // (e.g., if they unsave an article directly from the Saved Page)
  return { savedArticles, isLoading, refetch: fetchSavedArticles };
}