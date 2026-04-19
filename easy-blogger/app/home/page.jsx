// app/(main)/home/page.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGE in this version
// ──────────────────────
// Reads the `tab` query param from the URL (set by Header when a user
// suggestion is clicked) and passes it as `initialTab` to SearchResults.
//
// URL examples:
//   /home?q=lily              → SearchResults opens on Articles tab (default)
//   /home?q=lily&tab=profiles → SearchResults opens on Profiles tab
//
// The normal home feed (no ?q param) is completely unchanged.
// ─────────────────────────────────────────────────────────────────────────────

"use client";
import { useRef, useEffect, useCallback } from "react";

import { Suspense } from "react"; //for a fallback UI
import { useSearchParams } from "next/navigation"; //For URL query parameters
import { Loader2 } from "lucide-react";

// Import hooks for feeds (middle and right)
import { useMainArticles } from "../../hooks/useMainArticles";
import { useTrending } from "../../hooks/useTrending";

//Components import
import MainFeed from "../../components/article/MainFeed";
import RightFeed from "../../components/article/RightFeed";
import SearchResults from "../../components/search/SearchResults";

import { DATA } from "../../components/article/ArticleList";

function HomeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const isSearching = !!(query && query.trim());
  const scrollRef = useRef(null);

  // "tab" is only set when a user suggestion is clicked in the autocomplete.
  // Defaults to "articles" for normal searches and article-suggestion clicks.
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "profiles" ? "profiles" : "articles";

  //for article data fetching
  const { articles, isLoading } = useMainArticles({ enabled: !isSearching });
  const { trending, isTrendingLoading } = useTrending();

  // Helper to save current scroll position
  const saveScroll = useCallback(() => {
    if (scrollRef.current) {
      sessionStorage.setItem("homeScroll", scrollRef.current.scrollTop.toString());
    }
  }, []);

  // scroll restoration (RESTORE)
  useEffect(() => {
    // We don't restore if searching or if data hasn't loaded yet
    if (isSearching || isLoading || articles.length === 0) return;

    const savedScroll = sessionStorage.getItem("homeScroll");
    if (!savedScroll) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: Number(savedScroll), behavior: "instant" });
        }
      });
    });
  }, [articles, isSearching, isLoading]);

  // scroll restoration (SAVE ON VIEW CHANGE)
  // This ensures that when the user starts a search, the current home scroll is saved
  useEffect(() => {
    if (isSearching) {
      saveScroll();
    }
  }, [isSearching, saveScroll]);

  // scroll restoration (SAVE ON UNMOUNT)
  useEffect(() => {
    return () => {
      saveScroll();
    };
  }, [saveScroll]);

  // --- Early Returns (Must stay below all Hooks) ---

  //return the search if a query exist
  if (isSearching) {
    return <SearchResults query={query.trim()} initialTab={initialTab} />;
  }

  //Wait for article data fetch
  if (isLoading && articles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
      </div>
    );
  }

  //main UI
  return (
    <>
      <div className="flex h-full overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={saveScroll} // Continuously save scroll to handle all navigation types
          className="p-8 mx-auto h-full overflow-y-auto flex-1"
        >
          <MainFeed articles={articles} />
        </div>

        <div className="hidden lg:block w-80 flex-none h-full overflow-y-auto">
          <RightFeed
            trending={trending}
            topics={DATA.topics}
            usersToFollow={DATA.usersToFollow}
          />
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}