"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Star, MessageCircle, CalendarDays, Bookmark, MoreHorizontal, Loader2 } from "lucide-react";
import { useArticle } from "../../../hooks/useArticle";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { article, isLoading, error } = useArticle(id);

  const [saved, setSaved] = useState(false);
  const [showCompact, setShowCompact] = useState(false);

  const scrollRef = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isLoading) return; // Don't run if loading

    const onScroll = () => {
      const cover = coverRef.current;
      if (!cover) return;

      const coverRect = cover.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      const coverBottomPastTop = coverRect.bottom <= containerRect.top + 8;
      setShowCompact(coverBottomPastTop);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isLoading]);

  if (isLoading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
    </div>
  );

  if (error || !article) return <div className="p-8 text-center">Article not found</div>;

  // ── Data Normalization ──────────────────────────────────────────────────
  // Mapping Prisma names to local variables for cleaner JSX
  const author = article.author || {};
  const displayName = author.displayName || "Unknown Author";
  const avatar = author.avatarUrl || `https://ui-avatars.com/api/?name=${displayName}`;
  const displayDate = article.createdAt 
    ? new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : "Recent";

  return (
    <div className="h-full overflow-hidden bg-white">
      <article ref={scrollRef} className="h-full overflow-y-auto">
        
        {/* Sticky compact header */}
        <div className={`sticky top-0 z-50 border-b border-[#e5e7eb] bg-white transition-all duration-200 ${
          showCompact ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}>
          <div className="max-w-5xl mx-auto px-8 md:px-12 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                <button className="px-3 py-1 rounded-full border border-teal-400 text-teal-600 text-xs hover:bg-teal-50 transition">
                  Follow
                </button>
                <h2 className="font-serif font-black text-lg truncate">{article.title}</h2>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Main page content */}
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-10">
          {/* AUTHOR ROW */}
          <div className="flex items-center gap-4">
            <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{displayName}</span>
              {author.isVerified && <BadgeCheck className="w-5 h-5 text-teal-500" />}
            </div>
            <button className="ml-4 px-4 py-1 rounded-full border border-teal-400 text-teal-600 text-sm hover:bg-teal-50 transition">
              Follow
            </button>
          </div>

          <h1 className="mt-8 text-5xl md:text-6xl font-black font-serif leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* COVER */}
          <div ref={coverRef} className="mt-6">
            <img 
              src={article.coverImage || article.thumbnail} 
              alt={article.title} 
              className="w-full h-[400px] object-cover rounded-sm" 
            />
          </div>

          {/* META ROW */}
          {/* META ROW */}
<div className="mt-4 flex items-center justify-between border-b border-gray-300 pb-3 text-gray-600 text-sm">
  <div className="flex items-center gap-8">
    
    {/* ✅ UPDATED: Rating Display */}
    <div className="flex items-center gap-2 text-teal-600 font-medium">
      <Star className="w-5 h-5 fill-teal-500 text-teal-500" />
      <span>
        {article.averageRating > 0 ? article.averageRating.toFixed(1) : "New"}
      </span>
      <span className="text-gray-400 font-normal">({article.ratingCount || 0})</span>
    </div>

    <div className="flex items-center gap-2">
      <MessageCircle className="w-5 h-5" />
      <span>{article._count?.comments || 0}</span>
    </div>

    <div className="flex items-center gap-2">
      <CalendarDays className="w-5 h-5" />
      <span>{displayDate}</span>
    </div>
  </div>

  <button onClick={() => setSaved((p) => !p)} className="hover:bg-gray-100 p-2 rounded-full transition">
    <Bookmark className={`w-5 h-5 ${saved ? "fill-black text-black" : ""}`} />
  </button>
</div>

          {/* CONTENT */}
          <div
            className="mt-8 prose prose-lg max-w-none prose-p:leading-8 prose-headings:font-serif"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
}