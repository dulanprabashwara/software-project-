import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 

export function useReadHistory() {
  const { user, profileLoading } = useAuth();
  const [readHistory, setReadHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReadHistory = useCallback(async () => {
    if (!user) {
      setReadHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/readHistory`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const json = await res.json();
      
      if (json.success) {
        setReadHistory(json.data || []);
      } else {
        console.error("Backend error:", json.message);
      }
    } catch (error) {
      console.error("Failed to fetch read history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    fetchReadHistory();
  }, [profileLoading, fetchReadHistory]);

  return { readHistory, isLoading, refetch: fetchReadHistory };
}