"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeCheck, MessageCircle, Star, Bookmark,
  MoreHorizontal, Sparkles, Clock, Flag,
} from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";

// Formats a UTC date string into a short readable date.
function formatDate(dateStr) {
  if (!dateStr) return "Date unknown";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return "Date unknown";
  }
}

export default function SearchArticleCard({ article, savedArticles = [] }) {
  const router = useRouter();
  const { user, profileLoading } = useAuth();

  const {
    id,
    title,
    content,
    summary,
    coverImage,
    publishedAt,
    createdAt,
    updatedAt,
    scheduledAt,
    status,
    averageRating = 0,
    ratingCount   = 0,
    commentCount  = 0,
    readingTime   = 0,
    isAiGenerated = false,
    author        = {},
    _count        = {},
  } = article;

  // ── Derived display values ────────────────────────────────────────────────

  const authorName     = author.displayName || "Guest Writer";
  const authorAvatar   = author.avatarUrl   || `https://ui-avatars.com/api/?name=Guest`;
  const authorUsername = author.username    || "guestauthor";

  const totalComments = _count?.comments ?? commentCount;

  const rawPublishDate  = status === "PUBLISHED" ? (publishedAt || createdAt) : (updatedAt || createdAt);
  const rawScheduleDate = status === "SCHEDULED"  ? scheduledAt : null;
  const displayDate     = formatDate(rawPublishDate);
  const scheduledDisplay = rawScheduleDate
    ? new Date(rawScheduleDate).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
      })
    : "Scheduled date unknown";

  const previewText = summary || (content ? content.replace(/<[^>]+>/g, "").slice(0, 200) : "");

  // ── Bookmark state ────────────────────────────────────────────────────────

  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialise bookmark state from the savedArticles list passed by SearchResults.
  useEffect(() => {
    if (savedArticles.length > 0) {
      setSaved(savedArticles.some((obj) => obj.id === id));
    }
  }, [savedArticles, id]);

  // ── Dropdown / Report state ───────────────────────────────────────────────

  const [moreOptions,        setMoreOptions]        = useState(false);
  const [isReportOpen,       setIsReportOpen]       = useState(false);
  const [reportReason,       setReportReason]       = useState("");
  const [reportDescription,  setReportDescription]  = useState("");
  const [isReporting,        setIsReporting]        = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleArticleClick = () => router.push(`/home/read?id=${id}`);

  // Saves or unsaves the article using the same endpoint as the home feed ArticleCard.
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
        method:  nextState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId: id }),
      });

      if (!res.ok) throw new Error("Failed to sync bookmark.");
    } catch (err) {
      setSaved(!nextState);
      alert(err.message || "Failed to sync bookmark.");
    } finally {
      setSaving(false);
    }
  };

  // Submits a report for this article.
  const handleReportSubmit = async () => {
    if (!user) {
      alert("You must be logged in to report an article.");
      return;
    }

    setIsReporting(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articleReports`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          articleId:   id,
          reason:      reportReason,
          description: reportDescription,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit report");
      }

      alert("Thank you. The report has been sent to our team.");
      setIsReportOpen(false);
      setReportReason("");
      setReportDescription("");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setIsReporting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      <article className="py-6 border-b border-[#E5E7EB] relative">

        {/* Author & date header */}
        <div className="flex items-center gap-2 mb-3">
          <img src={authorAvatar} alt={authorName} className="w-8 h-8 rounded-full object-cover" />
          <span className="text-xl font-medium text-[#111827]">
            {authorName}
            <span className="text-xs text-gray-500"> @{authorUsername}</span>
          </span>

          {author.isPremium && (
            <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" title="Premium Author" />
          )}

          <span className="text-sm text-[#6B7280]">
            {status === "PUBLISHED" ? (
              <span>{displayDate}</span>
            ) : status === "SCHEDULED" ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {scheduledDisplay}
              </span>
            ) : (
              "Date unknown"
            )}
          </span>

          {isAiGenerated && (
            <span className="flex items-center gap-1 ml-2 text-[10px] font-semibold border border-[#1ABC9C] text-[#1ABC9C] bg-purple-50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> AI Generated
            </span>
          )}
        </div>

        {/* Title and content preview */}
        <div className="flex gap-6 justify-between">
          <div className="flex-1">
            <div className="h-14">
              <h2
                className="text-xl font-bold text-[#111827] mb-2 leading-tight font-serif hover:text-[#1ABC9C] cursor-pointer transition-colors duration-150 line-clamp-2"
                onClick={handleArticleClick}
              >
                {title || "Untitled Article"}
              </h2>
            </div>
            <div
              className="line-clamp-3 h-18 text-gray-500 text-[16px] leading-6"
              dangerouslySetInnerHTML={{ __html: previewText || "<p>No content available.</p>" }}
            />
          </div>

          {coverImage && (
            <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
              <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Interaction footer */}
        <div className="flex items-center justify-between mt-4 relative">
          <div className="flex items-center gap-4 text-sm text-[#6B7280]">

            <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              <span>{totalComments || "-"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-[#1ABC9C] text-[#1ABC9C]" strokeWidth={1.5} />
              <span className="font-medium text-[#1ABC9C]">
                {averageRating > 0 ? averageRating.toFixed(1) : "-"}
              </span>
              <span className="text-[#6B7280]">[{ratingCount || 0}]</span>
            </div>

            {readingTime > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                {readingTime} min read
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 relative">
            <button
              onClick={toggleBookmark}
              disabled={saving || profileLoading}
              className={`group p-2 rounded-full transition-colors duration-150 ${
                saved ? "bg-white" : "hover:bg-[#E8F8F5]"
              } ${(saving || profileLoading) ? "opacity-70 cursor-not-allowed" : ""}`}
              title={saved ? "Saved" : "Save"}
            >
              <Bookmark
                className={`w-5 h-5 transition-colors duration-150 ${
                  saved ? "text-[#1abc9c] fill-[#1abc9c]" : "text-[#1abc9c] group-hover:text-[#1ABC9C]"
                }`}
                strokeWidth={1.5}
              />
            </button>

            <button
              className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150"
              onClick={() => setMoreOptions(!moreOptions)}
            >
              <MoreHorizontal className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150" />
            </button>

            {moreOptions && (
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-white w-36 border border-[#e5e7eb] rounded-xl drop-shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => { setIsReportOpen(true); setMoreOptions(false); }}
                  className="flex items-center gap-3 w-full h-10 px-4 hover:bg-red-50 transition-colors"
                >
                  <Flag className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Report modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Report Article</h3>

            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg p-2 mb-3 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Reason (e.g. Spam, Harassment)"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />

            <textarea
              className="w-full border border-gray-200 rounded-lg p-2 mb-4 h-24 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              placeholder="Provide details..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsReportOpen(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={isReporting || !reportReason}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                {isReporting ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}