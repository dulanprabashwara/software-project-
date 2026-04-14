// components/search/SearchArticleCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Article card for search results. Uses BACKEND field names.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  MessageCircle,
  Star,
  Clock,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    });
  } catch {
    return "";
  }
}

export default function SearchArticleCard({ article }) {
  const router = useRouter();

  const {
    id,
    title,
    summary,
    content,
    coverImage,
    publishedAt,
    likeCount    = 0,
    commentCount = 0,
    readingTime  = 0,
    author       = {},
    _count       = {},
    // isSaved is stamped by the backend search service when user is logged in.
    // Falls back to false for anonymous visitors or articles where it wasn't checked.
    isSaved: initialSaved = false,
  } = article;

  const totalComments = _count?.comments ?? commentCount;

  // ── Save / Bookmark state ─────────────────────────────────────────────────
  // Initialised from the backend value so the icon renders correctly on first paint.
  const [saved,  setSaved]  = useState(Boolean(initialSaved));
  const [saving, setSaving] = useState(false);

  const avatarSrc =
    author.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      author.displayName || author.username || "U"
    )}&background=1ABC9C&color=fff`;

  const previewText =
    summary ||
    (content ? content.replace(/<[^>]+>/g, "").slice(0, 200) : "");

  const handleArticleClick = () => {
    router.push(`/home/read?id=${id}`);
  };

  // ── Toggle bookmark ───────────────────────────────────────────────────────
  // Uses the same /api/saved-articles Next.js route as the existing ArticleCard
  // so save/unsave behaviour is identical throughout the app.
  const toggleBookmark = async () => {
    const next = !saved;

    // Optimistic flip
    setSaved(next);

    try {
      setSaving(true);

      const res = await fetch("/api/saved-articles", {
        method:  next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        // POST sends the full article object; DELETE sends just the id —
        // exactly the same payload shape as the existing ArticleCard uses.
        body: JSON.stringify(next ? { article } : { id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
    } catch (err) {
      // Revert on error
      setSaved(!next);
      console.error("Bookmark toggle failed:", err.message || err);
    } finally {
      setSaving(false);
    }
  };

  return (
    // BORDER FIX: removed `last:border-0` so the last card always has border-b.
    // With multiple cards each has a bottom border creating clean separation.
    // With a single card it now has both top padding and a bottom border,
    // so it feels like a contained item rather than an endless element.
    <article className="py-6 border-b border-[#E5E7EB]">

      {/* Author row */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={avatarSrc}
          alt={author.displayName || author.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-[#111827]">
          {author.displayName || author.username || "Unknown"}
        </span>
        {author.isPremium && (
          <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" />
        )}
        <span className="text-sm text-[#6B7280]">
          · {formatDate(publishedAt)}
        </span>
      </div>

      {/* Title + thumbnail */}
      <div className="flex gap-6 justify-between">
        <div className="flex-1">
          <h2
            className="text-xl font-bold text-[#111827] mb-2 leading-tight font-serif hover:text-[#1ABC9C] cursor-pointer transition-colors duration-150"
            onClick={handleArticleClick}
          >
            {title}
          </h2>
          {previewText && (
            <p className="text-gray-500 text-[16px] leading-6 line-clamp-3">
              {previewText}
            </p>
          )}
        </div>
        {coverImage && (
          <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Bottom row — stats left, actions right */}
      <div className="flex items-center justify-between mt-4">

        {/* Left: comment + like + reading time */}
        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span>{totalComments}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <Star className="w-5 h-5" strokeWidth={1.5} />
            <span>{likeCount}</span>
          </button>
          {readingTime > 0 && (
            <span className="flex items-center gap-1.5 text-[#6B7280]">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              {readingTime} min read
            </span>
          )}
        </div>

        {/* Right: bookmark + more */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleBookmark}
            disabled={saving}
            className={`group p-2 rounded-full transition-colors duration-150 ${
              saved ? "bg-white" : "hover:bg-[#E8F8F5]"
            } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
            aria-pressed={saved}
            title={saved ? "Saved" : "Save for later"}
          >
            {/*
              Bookmark icon visual states
            */}
            <Bookmark
              className={`w-5 h-5 transition-colors duration-150 ${
                saved
                  ? "text-white fill-[#1abc9c]"
                  : "text-[#1abc9c] group-hover:text-[#1ABC9C]"
              }`}
              strokeWidth={1.5}
            />
          </button>

          <button className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150">
            <MoreHorizontal
              className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150"
            />
          </button>
        </div>
      </div>
    </article>
  );
}
