 
"use client";
 
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
 
import { DATA } from "../../components/article/ArticleList";
import MainFeed from "../../components/article/MainFeed";
import RightFeed from "../../components/article/RightFeed";
import SearchResults from "../../components/search/SearchResults"; // ← NEW
 
// Inner component — uses useSearchParams which requires Suspense wrapper
function HomeContent() {
  const searchParams = useSearchParams();
  const query        = searchParams.get("q"); // null when not searching
 
  // ── Search mode ──────────────────────────────────────────────────────────
  if (query && query.trim()) {
    return <SearchResults query={query.trim()} />;
  }
 
  // ── Normal home feed (original, untouched) ───────────────────────────────
  return (
    <>
      <div className="flex h-full overflow-hidden">
        <div className="p-8 mx-auto h-full overflow-y-auto flex-1">
          <MainFeed articles={DATA.articles} />
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
 
// Suspense wrapper required because useSearchParams() opts out of static
// rendering in Next.js 14 App Router. The fallback is a minimal spinner that
// matches the page's teal brand colour.
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
