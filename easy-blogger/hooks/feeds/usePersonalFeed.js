import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/context/AuthContext";
import { api } from "../../lib/api";

const ARTICLE_LIMIT = 5;

// Module-level cache so state survives tab switches within the same session
const feedCache = {};

export function usePersonalFeed() {
  const { user, profileLoading } = useAuth();

  const [articles, setArticles]         = useState([]);
  const [interests, setInterests]       = useState([]);       // AI-derived topics
  const [noHistory, setNoHistory]       = useState(false);    // true → user has no read history
  const [usingFallback, setUsingFallback] = useState(false);  // true → AI returned no interests
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const [isLoading, setIsLoading]       = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (profileLoading) return;

    // Guests can't use this feed (requires auth)
    if (!user) {
      setIsLoading(false);
      return;
    }

    const cacheKey = user.uid;

    // Restore from cache if user navigated away and came back
    if (feedCache[cacheKey]) {
      const c = feedCache[cacheKey];
      setArticles(c.articles);
      setInterests(c.interests);
      setNoHistory(c.noHistory);
      setUsingFallback(c.usingFallback);
      setPage(c.page);
      setHasMore(c.hasMore);
      setIsLoading(false);
      return;
    }

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const token  = await user.getIdToken();
        const data   = await api.getPersonalFeed(1, token);
        const batch  = data.articles || [];
        const isMore = batch.length === ARTICLE_LIMIT;

        setArticles(batch);
        setInterests(data.interests || []);
        setNoHistory(Boolean(data.noHistory));
        setUsingFallback(Boolean(data.usingFallback));
        setPage(2);
        setHasMore(isMore);

        feedCache[cacheKey] = {
          articles:     batch,
          interests:    data.interests || [],
          noHistory:    Boolean(data.noHistory),
          usingFallback: Boolean(data.usingFallback),
          page:         2,
          hasMore:      isMore,
        };
      } catch (err) {
        console.error("[usePersonalFeed] Initial fetch error:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [user, profileLoading]);

  // ── Load more (infinite scroll) ─────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || isLoading || !user) return;

    setIsFetchingMore(true);
    try {
      const token = await user.getIdToken();
      const data  = await api.getPersonalFeed(page, token);
      const batch = data.articles || [];

      if (batch.length === 0) {
        setHasMore(false);
        const cacheKey = user.uid;
        if (feedCache[cacheKey]) feedCache[cacheKey].hasMore = false;
      } else {
        setArticles((prev) => {
          const combined = [...prev, ...batch];
          const cacheKey = user.uid;
          feedCache[cacheKey] = {
            ...(feedCache[cacheKey] || {}),
            articles: combined,
            page:     page + 1,
            hasMore:  batch.length === ARTICLE_LIMIT,
          };
          return combined;
        });
        setPage((p) => p + 1);
        setHasMore(batch.length === ARTICLE_LIMIT);
      }
    } catch (err) {
      console.error("[usePersonalFeed] Load more error:", err.message);
    } finally {
      setIsFetchingMore(false);
    }
  }, [page, isFetchingMore, hasMore, isLoading, user]);

  return {
    articles,
    interests,
    noHistory,
    usingFallback,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
  };
}
