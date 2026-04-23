"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, MessageCircle, Star, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";  

export default function ArticleCard({ article }) {
  // ── Data Mapping ────────────────────────────────────────────────────────
  // If author is null, we use a fallback name and avatar.
  const authorName = article.author?.displayName || "Guest Writer"; 
  const authorAvatar = article.author?.avatarUrl || "https://ui-avatars.com/api/?name=Guest";
  const { user, profileLoading } = useAuth();
  const rawDate =
    article.status === "PUBLISHED"
      ? article.publishedAt || article.createdAt
      : article.updatedAt || article.createdAt;

  const displayDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  : "Recent";
  
  const storageKey = useMemo(() => `saved:${article.id}`, [article.id]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Load initial saved state (so refresh keeps it green)
  useEffect(() => {
    setSaved(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

 const toggleBookmark = async () => {
    // GUARD: Stop unauthenticated users from clicking
    if (!user) {
      alert("Please log in to save articles!");
      // Optionally: router.push('/login');
      return; 
    }

    const next = !saved;
    setSaved(next);
    localStorage.setItem(storageKey, next ? "1" : "0");

    try {
      setSaving(true);

      // Get the fresh Firebase token from the context user
      const token = await user.getIdToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saveArticle`, {
        method: next ? "POST" : "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Pass token to your backend
        },
        body: JSON.stringify({ articleId: article.id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
    } catch (err) {
      setSaved(!next);
      localStorage.setItem(storageKey, !next ? "1" : "0");
      alert(err.message || "Failed to sync bookmark.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="py-6 border-b border-[#E5E7EB] last:border-0">
      <div className="flex items-center gap-2 mb-3">
        <img
          src={authorAvatar}
          alt={authorName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-[#111827]">{authorName}</span>

        {/* Optional chaining safely checks if author exists before checking isVerified */}
        {article.author?.isVerified && <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" />}

        <span className="text-sm text-[#6B7280]">· {displayDate}</span>
      </div>

      <div className="flex gap-6 justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#111827] mb-2 leading-tight font-serif hover:text-[#1ABC9C] cursor-pointer transition-colors duration-150" 
          onClick={() => router.push(`/home/read?id=${article.id}`)}>
            {article.title || "Untitled Article"}
          </h2>

          <div className="line-clamp-3">
            <div
              className="text-gray-500 text-[16px] leading-6 **:text-gray-500 **:text-[16px]"
              dangerouslySetInnerHTML={{ __html: article.content || "<p>No content available.</p>" }}
            />
          </div>
        </div>

        {article.coverImage && (
          <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span>{article._count?.comments || 0}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[#1ABC9C]">
    <Star className="w-5 h-5 fill-[#1ABC9C]" strokeWidth={1.5} />
    <span className="font-medium">
      {article.averageRating > 0 ? article.averageRating.toFixed(1) : "New"}
    </span>
    <span className="text-[#6B7280]">({article.ratingCount || 0})</span>
  
</div>
        </div>

        <div className="flex items-center gap-1">
          <button
          type="button"
          onClick={toggleBookmark}
          // Disable the button if auth is still loading OR if it is actively saving
          disabled={saving || profileLoading} 
          className={`group p-2 rounded-full transition-colors duration-150 ${
            saved ? "bg-white" : "hover:bg-[#E8F8F5]"
          } ${(saving || profileLoading) ? "opacity-70 cursor-not-allowed" : ""}`}
          aria-pressed={saved}
          title={saved ? "Saved" : "Save"}
        >
            <Bookmark
              className={`w-5 h-5 transition-colors duration-150 ${
                saved ? "text-[#1abc9c] fill-[#1abc9c]" : "text-[#1abc9c] group-hover:text-[#1ABC9C]"
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