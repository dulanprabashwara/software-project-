import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 
import { api } from "../lib/api"; // Ensure this has the new stats method
 
export function useArticleStats() {
  const { user, profileLoading } = useAuth();
  const [stats, setStats] = useState([]); // Renamed for clarity
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticleStats = useCallback(async () => {
    // 1. Wait for user to be available
    if (!user) {
      setStats([]);
      setIsLoading(false);
      return;
    }
 
    setIsLoading(true);
    setError(null);

    try {
      // 2. Get the Firebase Token
      const token = await user.getIdToken();
      
      // 3. Call the backend (Make sure api.js has this method!)
      const data = await api.getUserArticleStats(token);
      
      // 4. Update state with the table data
      setStats(data || []);
    } catch (err) {
      console.error("Hook Error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 
 
  useEffect(() => {
    // Don't fetch if the profile is still loading from Firebase
    if (profileLoading) return;
    fetchArticleStats();
  }, [profileLoading, fetchArticleStats]);
 
  return { 
    stats,         // Your array of article details
    isLoading, 
    error, 
    refetch: fetchArticleStats 
  };
}