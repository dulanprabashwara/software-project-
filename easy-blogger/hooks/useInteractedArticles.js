import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 

export function useInteractedArticles() {
  const { user, profileLoading } = useAuth();
  const [interactedArticles, setInteractedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInteractedArticles = useCallback(async () => {
    if (!user) {
      setInteractedArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interactedArticles`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const json = await res.json();
      
      if (json.success) {
        setInteractedArticles(json.data || []);
      } else {
        console.error(json.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    
    fetchInteractedArticles();
  }, [profileLoading, fetchInteractedArticles]);

  return { interactedArticles, isLoading, refetch: fetchInteractedArticles };
}