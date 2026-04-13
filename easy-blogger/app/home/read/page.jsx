"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Star, MessageCircle, CalendarDays, Bookmark, MoreHorizontal } from "lucide-react";
import { DATA } from "../../../components/article/ArticleList";

export default function Page() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const article = useMemo(() => DATA.articles.find((a) => a.id === id), [id]);

  const [saved, setSaved] = useState(false);
  const [showCompact, setShowCompact] = useState(false);

  const scrollRef = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      // When the bottom of the cover goes above the top of the scroll container, show compact bar
      const cover = coverRef.current;
      if (!cover) return;

      const coverRect = cover.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();

      const coverBottomPastTop = coverRect.bottom <= containerRect.top + 8;
      setShowCompact(coverBottomPastTop);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (!id || !article) return <div className="p-8">Article not found</div>;

  return (
    <div className="h-full overflow-hidden bg-white">
      <article ref={scrollRef} className="h-full overflow-y-auto">
        {/* Sticky compact header (appears after scrolling past cover) */}
        <div
          className={`sticky top-0 z-50 border-b border-[#e5e7eb] bg-white transition-all duration-200 ${
            showCompact ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="max-w-5xl mx-auto px-8 md:px-12 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={article.authorAvatar}
                  alt={article.authorName}
                  className="w-8 h-8 rounded-full object-cover"
                />

                <button className="px-3 py-1 rounded-full border border-teal-400 text-teal-600 text-xs hover:bg-teal-50 transition">
                  Follow
                </button>

                <h2 className="font-serif font-black text-lg truncate">
                  {article.title}
                </h2>
              </div>

              <button className="p-2 rounded-full hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{article.likes}</span>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{article.comments}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{article.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main page content */}
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-10">
          {/* AUTHOR ROW */}
          <div className="flex items-center gap-4">
            <img
              src={article.authorAvatar}
              alt={article.authorName}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{article.authorName}</span>
              {article.verified && <BadgeCheck className="w-5 h-5 text-teal-500" />}
            </div>

            <button className="ml-4 px-4 py-1 rounded-full border border-teal-400 text-teal-600 text-sm hover:bg-teal-50 transition">
              Follow
            </button>
          </div>

          {/* TITLE */}
          <h1 className="mt-8 text-5xl md:text-6xl font-black font-serif leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* COVER (this scrolls away) */}
          <div ref={coverRef} className="mt-6">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-[260px] object-cover rounded-sm"
            />
          </div>

          {/* META ROW */}
          <div className="mt-4 flex items-center justify-between border-b border-gray-300 pb-3 text-gray-600 text-sm">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>{article.likes}</span>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>{article.comments}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                <span>{article.date}</span>
              </div>
            </div>

            <button
              onClick={() => setSaved((p) => !p)}
              className="hover:bg-gray-100 p-2 rounded-full transition"
            >
              <Bookmark className={`w-5 h-5 ${saved ? "fill-black text-black" : ""}`} />
            </button>
          </div>

          {/* CONTENT */}
          <div
            className="mt-8 prose prose-lg max-w-none prose-p:leading-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
}