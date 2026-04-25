"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, BadgeCheck, Star, MessageCircle, CalendarDays, Flag, X, MoreHorizontal, Bookmark } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useArticle } from "../../../hooks/useArticle";
import { Comments } from "../../../components/article/Comments";

// Import the saved articles hook
import { useSavedArticles } from "../../../hooks/useSavedArticles";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const { user, userProfile, loading: authLoading } = useAuth();
  const { article, isLoading: articleLoading, error } = useArticle(id);
  const [token, setToken] = useState(null);

  // --- Bookmark State & Hook ---
  const { savedArticles } = useSavedArticles();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showCompact, setShowCompact] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const scrollRef = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => {
    if (user) {
      user.getIdToken().then((t) => setToken(t));
    } else {
      setToken(null);
    }
  }, [user]);

  // Sync saved status with the database hook
  useEffect(() => {
    if (savedArticles?.length > 0 && article?.id) {
      const isSavedInDb = savedArticles.some((obj) => obj.id === article.id);
      setSaved(isSavedInDb);
    }
  }, [savedArticles, article?.id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || articleLoading) return;
    const onScroll = () => {
      if (!coverRef.current) return;
      const rect = coverRef.current.getBoundingClientRect();
      setShowCompact(rect.bottom <= 80);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [articleLoading]);

  // --- Bookmark Toggle Logic ---
  const toggleBookmark = async () => {
    if (!user) {
      alert("Please log in to save articles!");
      return; 
    }

    const nextState = !saved;
    setSaved(nextState);
    setSaving(true);

    try {
      // Use the token fetched from context
      const currentToken = token || await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/savedArticle`, {
        method: nextState ? "POST" : "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}` 
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

  if (articleLoading || authLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
    </div>
  );

  if (error || !article) return <div className="p-8 text-center">Article not found</div>;

  const rawDate = article.status === "PUBLISHED" 
    ? article.publishedAt || article.createdAt 
    : article.scheduledAt || article.updatedAt || article.createdAt;

  const displayDate = rawDate 
    ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recent";

  return (
    <div className="h-full overflow-hidden bg-white">
      <article ref={scrollRef} className="h-full overflow-y-auto scroll-smooth">
        
        {/* Sticky Header */}
        <div className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-all ${
          showCompact ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}>
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-2 md:py-3 flex items-center justify-between">
            
            {/* Left Side: Author & Title */}
            <div className="flex items-center gap-3 min-w-0 mr-4">
              <img src={article.author?.avatarUrl} className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0" alt="" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] md:text-xs font-semibold text-gray-500 truncate">
                  {article.author?.displayName}
                </span>
                <h2 className="font-serif font-bold text-sm md:text-base text-gray-900 truncate max-w-[150px] md:max-w-[400px]">
                  {article.title}
                </h2>
              </div>
            </div>

            {/* Right Side: Stats & Actions */}
            <div className="flex items-center gap-3 md:gap-5 text-gray-500 shrink-0">
              
              <div className="hidden sm:flex items-center gap-4 md:gap-5 border-r border-gray-200 pr-4 md:pr-5">
                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs md:text-sm">
                  <CalendarDays className="w-4 h-4" strokeWidth={1.5} />
                  <span>{displayDate}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1" title={`Average: ${article.averageRating?.toFixed(1) || 0}`}>
                  <Star className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs md:text-sm font-medium">
                    {article.averageRating > 0 ? article.averageRating.toFixed(1) : "0"}
                  </span>
                </div>

                {/* Comments */}
                <div className="flex items-center gap-1.5 text-xs md:text-sm">
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span>{article.commentCount || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleBookmark}
                  disabled={saving}
                  className="hover:text-teal-500 transition-colors disabled:opacity-50" 
                  title={saved ? "Saved" : "Save Article"}
                >
                  <Bookmark 
                    className={`w-4 h-4 md:w-5 md:h-5 ${saved ? "fill-teal-500 text-teal-500" : ""}`} 
                    strokeWidth={1.5} 
                  />
                </button>
                <button 
                  onClick={() => setIsReportOpen(true)} 
                  className="hover:text-red-500 transition-colors" 
                  title="Report Article"
                >
                  <Flag className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                </button>
              </div>

            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 md:px-12 py-10">
          
          {/* Author Row */}
          <div className="flex items-center gap-3 mb-6">
            <img src={article.author?.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{article.author?.displayName}</span>
              {article.author?.role === "ADMIN" && <BadgeCheck className="w-4 h-4 text-teal-500" />}
            </div>
            <button className="text-xs font-semibold text-teal-600 border border-teal-400 rounded-full px-3 py-1 hover:bg-teal-50 transition-colors">
              Follow
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black font-serif mb-6 leading-tight text-black">
            {article.title}
          </h1>

          {/* Cover Image */}
          <div className="flex min-h-[220px] max-h-[420px] items-center justify-center overflow-hidden rounded-lg bg-white mb-2">
            <img ref={coverRef} src={article.coverImage} className="max-h-[420px] max-w-full object-contain" alt="" />
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-8 text-sm text-gray-500">
            <div className="flex items-center gap-6">
              
              {/* Global Average Star Rating */}
              <div className="flex items-center gap-0.5" title={`Average: ${article.averageRating?.toFixed(1) || 0}`}>
                <Star className="w-5 h-5   " strokeWidth={1.5} />
                <span className="ml-2 font-medium  ">
                  {article.averageRating > 0 ? article.averageRating.toFixed(1) : "0"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                <span>{article.commentCount || 0}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-5 h-5" strokeWidth={1.5} />
                <span>{displayDate}</span>
              </div>

            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleBookmark}
                disabled={saving}
                className="hover:text-teal-500 transition-colors disabled:opacity-50" 
                title={saved ? "Saved" : "Save Article"}
              >
                <Bookmark 
                  className={`w-5 h-5 ${saved ? "fill-teal-500 text-teal-500" : ""}`} 
                  strokeWidth={1.5} 
                />
              </button>
              <button 
                onClick={() => setIsReportOpen(true)} 
                className="hover:text-red-500 transition-colors"
                title="Report Article"
              >
                <Flag className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-teal prose-lg max-w-none mb-20" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Comments Section */}
          <div className="border-t pt-12">
            <h3 className="text-2xl font-black font-serif mb-8">Responses ({article._count?.comments || 0})</h3>
            <Comments 
              articleId={id} 
              currentUser={userProfile} 
              token={token} 
            />
          </div>
        </div>
      </article>

      {/* Dummy Report Popup Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z- flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold font-serif text-gray-900">Report Article</h3>
              <button onClick={() => setIsReportOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Please let us know why you are reporting this article. Our team will review it against our community guidelines.
            </p>
            
            <textarea 
              className="w-full border border-gray-200 rounded-lg p-3 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" 
              placeholder="Provide details about the issue..."
            />
            
            <div className="flex gap-3 justify-end">
              <button 
                className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsReportOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                onClick={() => {
                  alert("Report submitted successfully.");
                  setIsReportOpen(false);
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}