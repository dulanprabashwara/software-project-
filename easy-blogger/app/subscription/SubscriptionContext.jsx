"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted state from localStorage
    const savedPremium = localStorage.getItem("isPremium");
    if (savedPremium) {
      setIsPremium(savedPremium === "true");
    }
    setIsLoading(false);
  }, []);

  const togglePremium = () => {
    setIsPremium((prev) => {
      const newState = !prev;
      localStorage.setItem("isPremium", String(newState));
      return newState;
    });
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
