// app/(main)/home/page.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGE in this version
// ──────────────────────
// Reads the `tab` query param from the URL (set by Header when a user
// suggestion is clicked) and passes it as `initialTab` to SearchResults.
//
// URL examples:
//   /home?q=lily          → SearchResults opens on Articles tab (default)
//   /home?q=lily&tab=profiles → SearchResults opens on Profiles tab
//
// The normal home feed (no ?q param) is completely unchanged.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { Suspense, useState, useEffect } from "react"; // Added hooks for DB data
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { DATA } from "../../components/article/ArticleList";
import MainFeed from "../../components/article/MainFeed";
import RightFeed from "../../components/article/RightFeed";
import SearchResults from "../../components/search/SearchResults";

function HomeContent() {
  const searchParams = useSearchParams();
  const query      = searchParams.get("q");
  // "tab" is only set when a user suggestion is clicked in the autocomplete.
  // Defaults to "articles" for normal searches and article-suggestion clicks.
  const tabParam   = searchParams.get("tab");
  const initialTab = tabParam === "profiles" ? "profiles" : "articles";

  // ── Database State ──────────────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch articles from your Express Backend ────────────────────────────
  useEffect(() => {
    const fetchHomeFeed = async () => {
      try {
        // Using your global .env variable
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homefeed`);
        const data = await response.json();
        
        // Use articles from DB if they exist, otherwise fallback to empty array
        setArticles(data.articles || []);
      } catch (error) {
        console.error("Error fetching from database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we aren't currently showing search results
    if (!query) {
      fetchHomeFeed();
    }
  }, [query]);

  // ── Search mode ─────────────────────────────────────────────────────────
  if (query && query.trim()) {
    return <SearchResults query={query.trim()} initialTab={initialTab} />;
  }

  // ── Normal home feed (original, untouched) ──────────────────────────────
  return (
    <>
      <div className="flex h-full overflow-hidden">
        <div className="p-8 mx-auto h-full overflow-y-auto flex-1">
          {/* Switched from DATA.articles to the 'articles' state from DB.
              Added a loader so the user knows the DB is being queried.
          */}
          {isLoading ? (
            <div className="flex justify-center p-10">
               <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
            </div>
          ) : (
            <MainFeed articles={articles} />
          )}
        </div>
        <div className="hidden lg:block w-80 flex-none h-full overflow-y-auto">
          <RightFeed
            trending={DATA.trending}
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