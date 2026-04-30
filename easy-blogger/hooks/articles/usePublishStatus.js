"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../app/context/AuthContext";
import { getDraftById } from "../../lib/articles/api";
import { getArticleFromResponse } from "../../lib/articles/utils";
import { API_BASE_URL } from "../../lib/api";

/*
 Shared hook for article status pages (published/scheduled).
 Centralizes article fetching and WordPress connection checks.
 */
export function usePublishStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser } = useAuth();

  const articleId = searchParams.get("id") || "";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wpConnected, setWpConnected] = useState(false);

  // Fetches the article data and redirects if not found or invalid
  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) {
        router.replace("/write/create");
        return;
      }

      try {
        setLoading(true);
        const response = await getDraftById(articleId);
        const data = getArticleFromResponse(response);

        if (!data) {
          router.replace("/write/create");
          return;
        }

        setArticle(data);
      } catch (error) {
        console.error("Failed to load article status:", error);
        router.replace("/write/create");
      } finally {
        setLoading(false);
      }
    };

    void loadArticle();
  }, [articleId, router]);

  // Checks the global WordPress connection status for the current user
  const checkWordPress = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/wordpress/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setWpConnected(Boolean(data?.data?.connected));
    } catch {
      setWpConnected(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    void checkWordPress();
  }, [checkWordPress]);

  return {
    articleId,
    article,
    loading,
    wpConnected,
    firebaseUser,
    router,
    checkWordPress,
  };
}
