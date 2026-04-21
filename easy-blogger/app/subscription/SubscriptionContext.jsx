"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { userProfile, loading: authLoading, profileLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Wait for both authLoad and profileLoad
  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (userProfile) {
      setIsPremium(!!userProfile.isPremium);
    } else {
      setIsPremium(false);
    }
    setIsLoading(false);
  }, [userProfile, authLoading, profileLoading]);

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