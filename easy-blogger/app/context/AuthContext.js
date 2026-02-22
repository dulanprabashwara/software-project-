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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // 1. Instantly unblock the UI so pages (like Profile) can render their shells
      setUser(firebaseUser ?? null);
      setLoading(false);

      // 2. Run the database sync in the background
      if (firebaseUser) {
        firebaseUser.getIdToken().then((token) => {
          api
            .syncUser(
              {
                email: firebaseUser.email,
                displayName:
                  firebaseUser.displayName || firebaseUser.email.split("@")[0],
                photoURL: firebaseUser.photoURL,
              },
              token,
            )
            .catch((error) => {
              console.error(
                "Failed to sync user with backend database:",
                error,
              );
            });
        });
      }
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
