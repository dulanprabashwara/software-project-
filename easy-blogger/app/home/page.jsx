// app/(main)/home/page.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGE in this version
// ──────────────────────
// Reads the `tab` query param from the URL (set by Header when a user
// suggestion is clicked) and passes it as `initialTab` to SearchResults.
//
// URL examples:
//   /home?q=lily              → SearchResults opens on Articles tab (default)
//   /home?q=lily&tab=profiles → SearchResults opens on Profiles tab
//
// The normal home feed (no ?q param) is completely unchanged.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { homefeed} from "../../hooks/homefeed";
import MainFeed from "../../components/article/MainFeed";
import RightFeed from "../../components/article/RightFeed";
import SearchResults from "../../components/search/SearchResults";
import { DATA } from "../../components/article/ArticleList";

function HomeContent() {
  const searchParams = useSearchParams();
  const query      = searchParams.get("q");

  //getting data from the homefeed hook
  const { data, isLoading } = homefeed(query);
  if (query) return <SearchResults query={query} />;
if (isLoading) {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
    </div>
  );
}
  // "tab" is only set when a user suggestion is clicked in the autocomplete.
  // Defaults to "articles" for normal searches and article-suggestion clicks.
  const tabParam   = searchParams.get("tab");
  const initialTab = tabParam === "profiles" ? "profiles" : "articles";

  // ── Search mode ─────────────────────────────────────────────────────────
  if (query && query.trim()) {
    return <SearchResults query={query.trim()} initialTab={initialTab} />;
  }

  // ── Normal home feed (original, untouched) ──────────────────────────────
  return (
    <>
      <div className="flex h-full overflow-hidden">
        <div className="p-8 mx-auto h-full overflow-y-auto flex-1">
          <MainFeed articles={data.articles} />
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
