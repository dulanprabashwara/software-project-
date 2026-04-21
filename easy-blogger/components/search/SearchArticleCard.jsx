"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, MessageCircle, Star, Clock, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { toggleArticleSave } from "../../lib/searchApi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function SearchArticleCard({ article }) {
  const router = useRouter();
  const { user: firebaseUser } = useAuth();

  const {
    id,
    title,
    summary,
    content,
    coverImage,
    publishedAt,
    averageRating = 0,
    ratingCount   = 0,
    commentCount  = 0,
    readingTime   = 0,
    author        = {},
    _count        = {},
    isSaved: initialSaved = false,
  } = article;

  const totalComments = _count?.comments ?? commentCount;

  const [saved,  setSaved]  = useState(Boolean(initialSaved));
  const [saving, setSaving] = useState(false);

  const avatarSrc =
    author.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      author.displayName || author.username || "U"
    )}&background=1ABC9C&color=fff`;

  const previewText =
    summary || (content ? content.replace(/<[^>]+>/g, "").slice(0, 200) : "");

  const handleArticleClick = () => router.push(`/home/read?id=${id}`);

  // Toggles bookmark state. Calls the backend engagement endpoint with auth token.
  // Reverts optimistic state on error.
  const handleBookmarkToggle = async () => {
    if (!firebaseUser || saving) return;

    const next = !saved;
    setSaved(next);
    setSaving(true);

    try {
      const token = await firebaseUser.getIdToken();
      const res   = await toggleArticleSave(id, token);

      // Reconcile with actual server state if response provides it
      if (res?.saved !== undefined) {
        setSaved(res.saved);
      }
    } catch (err) {
      setSaved(!next);
      console.error("Bookmark toggle failed:", err.message || err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="py-6 border-b border-[#E5E7EB]">

      <div className="flex items-center gap-2 mb-3">
        <img
          src={avatarSrc}
          alt={author.displayName || author.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-[#111827]">
          {author.displayName || author.username || "Unknown"}
        </span>
        {author.isPremium && <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" />}
        <span className="text-sm text-[#6B7280]">· {formatDate(publishedAt)}</span>
      </div>

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

      <div className="flex items-center justify-between mt-4">

        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span>{totalComments}</span>
          </button>

          {/* Rating display — matches home feed ArticleCard style */}
          <div className="flex items-center gap-1.5 text-[#1ABC9C]">
            <Star className="w-5 h-5 fill-[#1ABC9C]" strokeWidth={1.5} />
            <span className="font-medium">
              {averageRating > 0 ? averageRating.toFixed(1) : "New"}
            </span>
            <span className="text-[#6B7280]">({ratingCount})</span>
          </div>

          {readingTime > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              {readingTime} min read
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBookmarkToggle}
            disabled={saving || !firebaseUser}
            className={`group p-2 rounded-full transition-colors duration-150 ${
              saved ? "bg-white" : "hover:bg-[#E8F8F5]"
            } ${saving || !firebaseUser ? "opacity-70 cursor-not-allowed" : ""}`}
            aria-pressed={saved}
            title={!firebaseUser ? "Sign in to save" : saved ? "Saved" : "Save for later"}
          >
            <Bookmark
              className={`w-5 h-5 transition-colors duration-150 ${
                saved ? "text-[#1abc9c] fill-[#1abc9c]" : "text-[#1abc9c]"
              }`}
              strokeWidth={1.5}
            />
          </button>

          <button className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150">
            <MoreHorizontal className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150" />
          </button>
        </div>
      </div>
    </article>
  );
}
