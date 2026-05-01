"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  BadgeCheck, MessageCircle, Star, Bookmark, 
  MoreHorizontal, BookOpen, Sparkles, Clock, Trash2 
} from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";  

export default function PublishedArticleCard({ 
  article, 
  savedArticles = [], 
  interactedArticles = [], 
  readHistory = [],
  onDeleteSuccess // Optional: Pass a function from the parent page to refresh the list!
}) {
  const router = useRouter();
  const { user, profileLoading } = useAuth();

  // ==========================================
  // 1. COMPONENT STATE
  // ==========================================

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moreOptions, setMoreOptions] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================================
  // 2. EFFECTS & INITIALIZATION
  // ==========================================

  useEffect(() => {
    if (savedArticles.length > 0) {
      setSaved(savedArticles.some((obj) => obj.id === article.id));
    }
  }, [savedArticles, article.id]);

  // ==========================================
  // 3. DATA CALCULATIONS & FORMATTING
  // ==========================================

  const userInteraction = interactedArticles.find((obj) => obj.id === article.id);
  const hasCommented = userInteraction ? userInteraction.commentStatus : false;
  const hasRated = userInteraction ? userInteraction.rateStatus : false;

  const readMatch = readHistory.find((obj) => obj.articleId === article.id);
  const rawReadDate = article.interactedAt || readMatch?.lastReadAt; 
  const readDateDisplay = rawReadDate
    ? new Date(rawReadDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;

  const authorName = article.author?.displayName || "Guest Writer"; 
  const authorAvatar = article.author?.avatarUrl || "https://ui-avatars.com/api/?name=Guest";
  
  const isPublished = article.status;
  const rawPublishDate = isPublished === "PUBLISHED"
      ? article.publishedAt || article.createdAt
      : article.updatedAt || article.createdAt;
      
  const displayDate = rawPublishDate
    ? new Date(rawPublishDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "Date unknown";

  const scheduledDate = isPublished === "SCHEDULED" && article.scheduledAt
    ? new Date(article.scheduledAt).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    : "Scheduled date unknown";

  // ==========================================
  // 4. API HANDLERS
  // ==========================================

  const toggleMoreOptions = () => setMoreOptions(!moreOptions);

  const toggleBookmark = async () => {
    if (!user) return alert("Please log in to save articles!");

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

  // --- DELETE HANDLER ---
  const handleDeleteSubmit = async () => {
    if (!user) return alert("You must be logged in.");

    setIsDeleting(true);

    try {
      const token = await user.getIdToken();
      
      // Notice we pass the article.id directly in the URL path parameters
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles/${article.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete article");
      }

      setIsDeleteOpen(false);
      
      // If the parent page passed a refresh function, call it so the deleted article disappears!
      if (onDeleteSuccess) {
        onDeleteSuccess(article.id);
      } else {
        alert("Article deleted successfully.");
      }

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // 5. RENDER UI
  // ==========================================

  return (
    <div className="relative"> 
      <article className="py-6 border-b border-[#E5E7EB] last:border-0 relative">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <img src={authorAvatar} alt={authorName} className="w-8 h-8 rounded-full object-cover" />
          <span className="text-sm font-medium text-[#111827]">{authorName}</span>
          {article.author?.isPremium && <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" />}

          <span className="text-sm text-[#6B7280]"> 
            {isPublished === "PUBLISHED" ? (
              <span>{displayDate}</span>
            ) : isPublished === "SCHEDULED" ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {scheduledDate}
              </span>
            ) : "date_unknown"}
          </span>

          {article.isAiGenerated && (
            <span className="flex items-center gap-1 ml-2 text-[10px] font-semibold border border-[#1ABC9C] text-[#1ABC9C] bg-purple-50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> AI Generated
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex gap-6 justify-between">
          <div className="flex-1">
            <div className="h-14">
              <h2 
                className="text-xl font-bold text-[#111827] mb-2 leading-tight font-serif hover:text-[#1ABC9C] cursor-pointer transition-colors duration-150 line-clamp-2" 
                onClick={() => router.push(`/home/read?id=${article.id}`)}
              >
                {article.title || "Untitled Article"}
              </h2>
            </div>
            <div className="line-clamp-3 h-18 text-gray-500 text-[16px] leading-6"
                 dangerouslySetInnerHTML={{ __html: article.content || "<p>No content available.</p>" }}
            />
          </div>

          {article.coverImage && (
            <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 relative">
          <div className="flex items-center gap-4 text-sm text-[#6B7280]">
            <button className={`flex items-center gap-1.5 transition-colors duration-150 ${hasCommented ? 'text-[#1ABC9C]' : 'hover:text-[#1ABC9C]'}`}>
              <MessageCircle className={`w-5 h-5 ${hasCommented ? 'fill-[#1ABC9C]' : ''}`} strokeWidth={1.5} />
              <span>{article.commentCount || "-"}</span>
            </button>

            <div className={`flex items-center gap-1.5 ${hasRated ? 'text-[#1ABC9C]' : ''}`}>
              <Star className={`w-5 h-5 ${hasRated ? 'fill-[#1ABC9C]' : ''}`} strokeWidth={1.5} />
              <span className="font-medium">{article.averageRating > 0 ? article.averageRating.toFixed(1) : "-"}</span>
              <span className="text-[#6B7280]"> [{article.ratingCount || 0}]</span>
            </div>

            {readDateDisplay && (
              <div className="flex items-center gap-1.5 text-[#6B7280] ml-2">
                <span>{readDateDisplay}</span>
                <BookOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 relative">
            <button
              onClick={toggleBookmark}
              disabled={saving || profileLoading} 
              className={`group p-2 rounded-full transition-colors duration-150 ${saved ? "bg-white" : "hover:bg-[#E8F8F5]"} ${(saving || profileLoading) ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <Bookmark className={`w-5 h-5 transition-colors duration-150 ${saved ? "text-[#1abc9c] fill-[#1abc9c]" : "text-[#1abc9c] group-hover:text-[#1ABC9C]"}`} strokeWidth={1.5} />
            </button>

            <button 
              className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150"
              onClick={toggleMoreOptions}
            >
              <MoreHorizontal className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150" />
            </button>

            {/* Dropdown Menu */}
            {moreOptions && (
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-white w-36 border border-[#e5e7eb] rounded-xl drop-shadow-lg z-50 overflow-hidden">
                <button 
                  onClick={() => {
                    setIsDeleteOpen(true);
                    setMoreOptions(false); 
                  }}
                  className="flex items-center gap-3 w-full h-10 px-4 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* ==========================================
          6. MODALS
          ========================================== */}
      
      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Article?</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              This action is permanent and cannot be undone. All comments and ratings associated with this article will be lost forever.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteOpen(false)} 
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteSubmit} 
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}