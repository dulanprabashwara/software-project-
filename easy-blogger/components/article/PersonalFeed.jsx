"use client";

import { Loader2, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { usePersonalFeed }    from "../../hooks/feeds/usePersonalFeed";
import { useSavedArticles }   from "../../hooks/feeds/useSavedArticles";
import ArticleCard            from "./ArticleCard";
import InfiniteScroll         from "../ui/InfiniteScroll";

// ── Interest topic pills shown at the top of the feed ────────────────────────
function InterestPills({ interests }) {
  if (!interests || interests.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-5 px-1">
      {interests.map((topic) => (
        <span
          key={topic}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                     bg-[#E8F8F5] text-[#0f9a77] border border-[#1abc9c]/30"
        >
          <TrendingUp className="w-3 h-3" />
          {topic}
        </span>
      ))}
    </div>
  );
}

// ── "No history" empty state ──────────────────────────────────────────────────
function NoHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E8F8F5] flex items-center justify-center mb-5">
        <BookOpen className="w-8 h-8 text-[#1abc9c]" />
      </div>
      <h3 className="text-lg font-bold text-[#111827] mb-2">
        Your personal feed is waiting
      </h3>
      <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
        Read a few articles and we'll use AI to figure out what topics you love,
        then surface articles tailored just for you.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-[#1abc9c] font-semibold">
        <Sparkles className="w-4 h-4" />
        Powered by AI · Updates every hour
      </div>
    </div>
  );
}

// ── AI header banner shown above the feed ────────────────────────────────────
function PersonalFeedHeader({ interests, usingFallback }) {
  return (
    <div className="flex items-start gap-3 mb-5 p-4 rounded-xl bg-gradient-to-r from-[#f0fdf9] to-[#e8f8f5] border border-[#1abc9c]/20">
      <div className="w-8 h-8 rounded-full bg-[#1abc9c]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-[#1abc9c]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#111827]">
          {usingFallback ? "Recommended for you" : "Matched to your interests"}
        </p>
        <p className="text-xs text-[#6B7280] mt-0.5">
          {usingFallback
            ? "Based on recent articles · AI interest profile updates hourly"
            : "AI analysed your reading history · Updates every hour"}
        </p>
        {!usingFallback && <InterestPills interests={interests} />}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PersonalFeed() {
  const {
    articles,
    interests,
    noHistory,
    usingFallback,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
  } = usePersonalFeed();

  const { savedArticles } = useSavedArticles();

  // Full-page loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#1abc9c]" />
        <p className="text-sm text-[#6B7280]">Analysing your reading interests…</p>
      </div>
    );
  }

  // User has no read history yet
  if (noHistory) {
    return <NoHistoryState />;
  }

  // Articles fetched but empty (should be rare — the fallback handles this server-side)
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <p className="text-sm text-[#6B7280]">No recommendations available right now. Check back later!</p>
      </div>
    );
  }

  return (
    <div>
      <PersonalFeedHeader interests={interests} usingFallback={usingFallback} />

      <InfiniteScroll
        loadMore={loadMore}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        endMessage="You've reached the end of your personal feed."
      >
        <div className="space-y-4 pb-10">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              savedArticles={savedArticles}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
