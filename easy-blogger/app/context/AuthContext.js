"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { api } from "../../lib/api";

const AuthContext = createContext(null);

/**
 * @function useAuth
 * @description
 * Custom hook to safely consume the Authentication Context.
 * @returns {Object} Context values including user state, loading properties, and modifier functions.
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * @component AuthProvider
 * @description
 * The root Context Provider for Authentication.
 * WHY: This component manages the absolute source of truth for a user's session.
 * It bridges the gap between Firebase Auth (which handles raw JWT identity) and our 
 * Postgres database (which handles business-logic roles like ADMIN and isPremium).
 * It listens to Firebase state changes and conditionally fetches the Postgres profile to 
 * ensure the UI never leaks protected routes or displays incorrect states.
 * 
 * @param {Object} props - React props.
 * @param {React.ReactNode} props.children - Child components requiring auth state.
 * @returns {JSX.Element} The Provider wrapping the application.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // loading = true only until Firebase confirms auth state (fast, ~50ms from cache).
  // userProfile fills in separately after the backend syncUser call completes.
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  /**
   * Optimistically updates the local profile state without requiring a full network refetch.
   */
  const updateProfile = useCallback((data) => {
    setUserProfile((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  /**
   * @function refreshProfile
   * @description
   * Forcibly re-fetches the user's Postgres profile using their current Firebase token.
   * WHY: Useful after a user performs an action that alters their database role (e.g., purchasing Premium) 
   * so the UI instantly updates to reflect their new permissions without requiring a hard refresh.
   * @returns {Promise<Object|null>} The refreshed profile data.
   */
  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    try {
      const token = await currentUser.getIdToken();
      const res = await api.getMe(token);
      if (res.success && res.data) {
        setUserProfile(res.data);
        setIsAdmin(res.data.role === "ADMIN");
        return res.data;
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
    return null;
  }, []);

  const hasSynced = useRef(false);

  /**
   * @function useEffect(onAuthStateChanged)
   * @description
   * Subscribes to Firebase's persistent authorization state. 
   * WHY: This prevents infinite loops and race conditions. When Firebase detects a valid session, 
   * we capture the `getIdToken()` and pass it to the backend `/sync` endpoint to fetch the matching 
   * Postgres data. The `hasSynced` ref prevents spamming the API on hot-reloads.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser ?? null);

      if (!firebaseUser) {
        // User logged out — clear everything and reset the sync flag
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
        setProfileLoading(false);
        hasSynced.current = false;
        return;
      }

      // Firebase confirmed the user — unlock the UI immediately.
      setLoading(false);

      // If we already synced this session, skip backend call to avoid rate limits.
      // hasSynced is a ref — always up-to-date inside closures, no stale value issue.
      if (hasSynced.current) {
        setProfileLoading(false);
        return;
      }

      // First time login: sync with backend to get role and full profile.
      setProfileLoading(true);
      try {
        const token = await firebaseUser.getIdToken();
        const res = await api.syncUser(
          {
            email: firebaseUser.email,
            displayName:
              firebaseUser.displayName || firebaseUser.email.split("@")[0],
            photoURL: firebaseUser.photoURL,
          },
          token,
        );
        if (res.success && res.data) {
          setUserProfile(res.data);
          setIsAdmin(res.data.role === "ADMIN");
          hasSynced.current = true;
        }
      } catch (error) {
        console.error("Failed to sync user with backend database:", error);
        // Fallback 1: try fetching the existing profile via getMe
        try {
          const token = await firebaseUser.getIdToken();
          const res = await api.getMe(token);
          if (res.success && res.data) {
            setUserProfile(res.data);
            setIsAdmin(res.data.role === "ADMIN");
            hasSynced.current = true;
            return;
          }
        } catch (getmeError) {
          console.error("getMe fallback also failed:", getmeError);
        }
        // Fallback 2: build a minimal profile from Firebase so the UI is never stuck
        setUserProfile({
          id: null,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          avatarUrl: firebaseUser.photoURL || null,
          username: firebaseUser.email?.split("@")[0] || "",
          bio: "",
          role: "USER",
          isPremium: false,
        });
        hasSynced.current = true;
      } finally {
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        profileLoading,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
