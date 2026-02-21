"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { api } from "../../lib/api";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Send Firebase token to the backend to sync user with PostgreSQL
          const token = await firebaseUser.getIdToken();
          await api.syncUser(
            {
              email: firebaseUser.email,
              displayName:
                firebaseUser.displayName || firebaseUser.email.split("@")[0],
              photoURL: firebaseUser.photoURL,
            },
            token,
          );
        } catch (error) {
          console.error("Failed to sync user with backend database:", error);
        }
      }
      setUser(firebaseUser ?? null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
