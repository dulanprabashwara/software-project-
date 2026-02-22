"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { userProfile, loading: authLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync premium status from backend profile
  useEffect(() => {
    if (authLoading) return;
    if (userProfile) {
      setIsPremium(!!userProfile.isPremium);
    }
    setIsLoading(false);
  }, [userProfile, authLoading]);

  // Dev toggle for testing (does not persist to backend)
  const togglePremium = () => {
    setIsPremium((prev) => !prev);
  };

  return (
    <SubscriptionContext.Provider
      value={{ isPremium, togglePremium, isLoading }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
