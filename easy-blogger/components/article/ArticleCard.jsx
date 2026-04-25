"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, MessageCircle, Star, Bookmark, MoreHorizontal, BookOpen, Crown, Sparkles } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";  

export default function ArticleCard({ 
  article, 
  savedArticles = [], 
  interactedArticles = [], 
  readHistory = [] 
}) {
  const router = useRouter();
  const { user, profileLoading } = useAuth();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (savedArticles.length > 0) {
      const isSavedInDb = savedArticles.some((obj) => obj.id === article.id);
      setSaved(isSavedInDb);
    }
  }, [savedArticles, article.id]);

  // --- STRICT USER INTERACTION CHECK ---
  // We ONLY look at the interactedArticles array because it is filtered by req.user.id in the backend.
  const userInteraction = interactedArticles.find((obj) => obj.id === article.id);
  const hasCommented = userInteraction ? userInteraction.commentStatus : false;
  const hasRated = userInteraction ? userInteraction.rateStatus : false;

  const readMatch = readHistory.find((obj) => obj.articleId === article.id);
  const rawReadDate = article.interactedAt || readMatch?.lastReadAt; 
  
  const readDateDisplay = rawReadDate
    ? new Date(rawReadDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const authorName = article.author?.displayName || "Guest Writer"; 
  const authorAvatar = article.author?.avatarUrl || "https://ui-avatars.com/api/?name=Guest";
  
  const rawPublishDate = article.status === "PUBLISHED"
      ? article.publishedAt || article.createdAt
      : article.scheduledAt || article.updatedAt || article.createdAt;

  const displayDate = rawPublishDate
    ? new Date(rawPublishDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  : "Recent";

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please log in to save articles!");
      return; 
    }

    const nextState = !saved;
    setSaved(nextState);
    setSaving(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/savedArticle`, {
        method: nextState ? "POST" : "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ articleId: article.id }),
      });

      if (!res.ok) throw new Error("Failed to sync bookmark.");
    } catch (err) {
      setSaved(!nextState);
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

        {article.author?.isVerified && <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" />}
        {article.author?.isPremium && <Crown className="w-4 h-4 text-yellow-500" title="Premium Author" />}

        <span className="text-sm text-[#6B7280]">· {displayDate}</span>

        {article.isAiGenerated && (
          <span className="flex items-center gap-1 ml-2 text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </span>
        )}
      </div>

      <div className="flex gap-6 justify-between">
        <div className="flex-1">
          <div className="h-14">
            <h2 
              className="text-xl font-bold text-[#111827] mb-2 leading-tight font-serif hover:text-[#1ABC9C] cursor-pointer transition-colors duration-150" 
              onClick={() => router.push(`/home/read?id=${article.id}`)}
            >
              {article.title || "Untitled Article"}
            </h2>
          </div>
          
          <div className="line-clamp-3 h-18">
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
          
          <button className={`flex items-center gap-1.5 transition-colors duration-150 ${hasCommented ? 'text-[#1ABC9C]' : 'hover:text-[#1ABC9C]'}`}>
            <MessageCircle className={`w-5 h-5 ${hasCommented ? 'fill-[#1ABC9C]' : ''}`} strokeWidth={1.5} />
            {/* We still show the global count of total comments, but the icon color is personal */}
            <span>{article.commentCount || "-"}</span>
          </button>

          <div className={`flex items-center gap-1.5 ${hasRated ? 'text-[#1ABC9C]' : ''}`}>
            <Star className={`w-5 h-5 ${hasRated ? 'fill-[#1ABC9C]' : ''}`} strokeWidth={1.5} />
            {/* Global average rating, but icon color is personal */}
            <span className="font-medium">
              {article.averageRating > 0 ? article.averageRating.toFixed(1) : "-"}
            </span>
            <span className="text-[#6B7280]"> [{article.ratingCount || 0}]</span>
          </div>

          {readDateDisplay && (
            <div className="flex items-center gap-1.5 text-[#6B7280] ml-2">
              <span>{readDateDisplay}</span>
              <BookOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleBookmark}
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