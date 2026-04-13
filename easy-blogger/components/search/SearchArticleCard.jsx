// components/search/SearchArticleCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Article card for search results.
// Uses BACKEND data field names (author.displayName, coverImage, publishedAt…)
// while matching the exact visual style of the existing ArticleCard component.
//
// Kept as a separate component so the existing ArticleCard (which uses mock
// data field names) is never touched.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, MessageCircle, Star, Clock } from "lucide-react";

/**
 * Formats a UTC date string into a readable short date, e.g. "Oct 27, 2025".
 */
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
  } = article;

  // Use commentCount from the field directly, or from _count if available
  const totalComments = _count?.comments ?? commentCount;

  // Fallback avatar using ui-avatars
  const avatarSrc =
    author.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      author.displayName || author.username || "U"
    )}&background=1ABC9C&color=fff`;

  // Preview text: prefer summary, fall back to plain-text stripped content
  const previewText =
    summary ||
    (content
      ? content.replace(/<[^>]+>/g, "").slice(0, 200)
      : "");

  const handleArticleClick = () => {
    router.push(`/home/read?id=${id}`);
  };

  return (
    <article className="py-6 border-b border-[#E5E7EB] last:border-0">
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

      {/* Title + thumbnail row */}
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
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-4 text-sm text-[#6B7280]">
        <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
          <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
          <span>{totalComments}</span>
        </button>

        <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
          <Star className="w-5 h-5" strokeWidth={1.5} />
          <span>{likeCount}</span>
        </button>

        {readingTime > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            {readingTime} min read
          </span>
        )}
      </div>
    </article>
  );
}
