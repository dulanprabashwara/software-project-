"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Loader2, BadgeCheck, Star, MessageCircle, 
  CalendarDays, Flag, Bookmark, AlertCircle
} from "lucide-react";

// Context & Custom Hooks
import { useAuth } from "../../context/AuthContext";
import { useArticle } from "../../../hooks/read/useArticle";
import { useSavedArticles } from "../../../hooks/feeds/useSavedArticles";
import { Comments } from "../../../components/article/Comments";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  // us and article details
  const { user, userProfile, loading: authLoading } = useAuth();
  const { article, isLoading: articleLoading, error } = useArticle(id);
  const { savedArticles } = useSavedArticles();
  const [token, setToken] = useState(null);

  //for raed page UI chages
  const [showCompact, setShowCompact] = useState(false); //compact info display
  //for comment and rating submissions
  const [saved, setSaved] = useState(false); 
  const [saving, setSaving] = useState(false);

  // for filing reports agains article
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // references 
  const scrollRef = useRef(null);
  const coverRef = useRef(null);

  //for error popups
  const [errorOcuurred, setErrorOccurred] = useState (false);

  

  // Manage Firebase Token
  useEffect(() => {
    if (user) {
      user.getIdToken().then(setToken);
    } else {
      setToken(null);
    }
  }, [user]);

  // 2. Record Read History (Runs once when article/token are ready)
  useEffect(() => {
    const recordVisit = async () => {
      if (!id || !token) return;
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/readHistory/record`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ articleId: id })
        });
      } catch (err) {
        console.error("Failed to record history:", err);
      }
    };
    recordVisit();
  }, [id, token]); 

  // Sync Bookmark Status
  useEffect(() => {
    if (savedArticles?.length > 0 && article?.id) {
      setSaved(savedArticles.some((obj) => obj.id === article.id)); //seeing if the list have
    }
  }, [savedArticles, article?.id]);

  // Handle Sticky Header Scroll Effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || articleLoading) return;
    
    const onScroll = () => {
      if (!coverRef.current) return;
      const rect = coverRef.current.getBoundingClientRect(); //get reference location
      setShowCompact(rect.bottom <= 80); // Show sticky header when cover image scrolls up
    };
    
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [articleLoading]);

  // bookmark

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please log in to save articles!");
      return; 
    }

    const nextState = !saved;
    setSaved(nextState); //  UI update
    setSaving(true);

    try {
      //send Article ID to be added to saved data table
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
      setSaved(!nextState); // Revert on failure
      alert(err.message || "Failed to sync bookmark.");
      errorPopup();
    } finally {
      setSaving(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!user) {
      alert("You must be logged in to report an article.");
      return; 
    }

    setIsReporting(true);

    try {
      const currentToken = token || await user.getIdToken();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articleReports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          articleId: article.id,
          reason: reportReason,
          description: reportDescription 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit report");
      }

      alert("Thank you. The report has been sent to our team.");
      setReportReason("");
      setReportDescription("");

    } catch (err) {
      console.error(err);
      console.log("Error creating report");
      setErrorOccurred((prev)=>!prev);
    } finally {
      setIsReporting(false);
      setIsReportOpen(false);

    }
  };

   //check for loading article/user

  if (articleLoading || authLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
    </div>
  );

  if (!article) 
    {
      return (

       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center w-150">
          
          <AlertCircle className="text-red-500 w-20 h-20 mb-4" />
          
          <h2 className="text-gray-900 font-semibold">Article not found</h2>
          <p className="text-gray-400 text-sm mb-6">Content unavailable</p>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
</div>
      )
    }
  // Format the display date
  const rawDate = article.publishedAt || null
 
  const displayDate = rawDate 
    ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Date not Found";

  return (
  <>
    {/*error popup */}
    {errorOcuurred && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-[300px] rounded-lg border border-red-300 bg-white p-6 shadow-2xl">
       <h2 className="text-xl font-bold text-red-600">Error Occurred</h2>
        <p className="mt-3 text-sm text-gray-700">Please try again.</p>
      
      {/*go back Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setErrorOccurred(false)}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>}

    <div className="h-full bg-white">
      <article ref={scrollRef} className="h-full overflow-y-auto scroll-smooth">
        
        {/* Sticky Header (Hidden until user scrolls down) */}
        <div className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-all ${
          showCompact ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}>
          {/*author avatar*/}
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-2 md:py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 mr-4">
              <img src={article.author?.avatarUrl} className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0" alt="Author Picture" />
              {/*Author name and username*/}
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] md:text-xs font-semibold text-gray-500 truncate">
                  {article.author?.displayName}  
                </span>
                <h2 className="font-serif font-bold text-sm md:text-base text-gray-900 truncate max-w-[150px] md:max-w-[400px]">
                  {article.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5 text-gray-500 shrink-0">
              <div className="hidden sm:flex items-center gap-4 md:gap-5 border-r border-gray-200 pr-4 md:pr-5">
                <div className="flex items-center gap-1.5 text-xs md:text-sm">
                  {/* publishe date*/}
                  <CalendarDays className="w-4 h-4" />
                  <span>{displayDate}</span>
                </div>
                {/* ratings*/}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">
                    {article.averageRating > 0 ? article.averageRating.toFixed(1)  : "0"}
                    [{article.ratingCount}]
                  </span>
                </div>
                {/*Comments amount*/}
                <div className="flex items-center gap-1.5 text-xs md:text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>{article.commentCount || 0}</span>
                </div>
              </div>

              {/* bookmark button */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleBookmark}
                  disabled={saving}
                  className="hover:text-teal-500 transition-colors disabled:opacity-50" 
                  title={saved ? "Saved" : "Save Article"}
                >
                  <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${saved ? "fill-teal-500 text-teal-500" : ""}`} />
                </button>
                <button 
                  onClick={() => setIsReportOpen(true)} 
                  className="hover:text-red-500 transition-colors" 
                  title="Report Article"
                >
                  <Flag className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Article Content */}
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-10">
          
          {/* Author Details */}
          <div className="flex items-center gap-3 mb-6">
            <img src={article.author?.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{article.author?.displayName}</span>
              {article.author?.isPremium === true && <BadgeCheck className="w-4 h-4 text-teal-500" />}
            </div>
            {userProfile?.id !== article.author?.id &&
              <button className="text-xs font-semibold text-teal-600 border border-teal-400 rounded-full px-3 py-1 hover:bg-teal-50 transition-colors">
                Follow
              </button>
            }       
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-serif mb-6 leading-tight text-black">
            {article.title}
          </h1>

          <div className="flex min-h-[220px] max-h-[420px] items-center justify-center overflow-hidden rounded-lg bg-white mb-2">
            <img ref={coverRef} src={article.coverImage} className="max-h-[420px] max-w-full object-contain" alt="" />
          </div>

          {/* Interaction Bar  */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-8 text-sm text-gray-500">
            <div className="flex items-center gap-6">
              {/* ratings*/}
              <div className="flex items-center gap-0.5">
                <Star className="w-5 h-5" />
                <span className="ml-2 font-medium">
                  {article.averageRating > 0 ? article.averageRating.toFixed(1) : "0"}
                  [{article.ratingCount}]

                </span>
              </div>

              {/* comments */}
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5" />
                <span>{article.commentCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-5 h-5" />
                <span>{displayDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleBookmark}
                disabled={saving}
                className="hover:text-teal-500 transition-colors disabled:opacity-50"
              >
                <Bookmark className={`w-5 h-5 ${saved ? "fill-teal-500 text-teal-500" : ""}`} />
              </button>
              <button 
                onClick={() => setIsReportOpen(true)} 
                className="hover:text-red-500 transition-colors"
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-teal prose-lg max-w-none mb-20" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Comments Section */}
          <div className="border-t pt-12">
            <h3 className="text-2xl font-black font-serif mb-8">Responses ({article._count?.comments || 0})</h3>
            <Comments 
              articleId={id} 
              currentUser={userProfile} 
              token={token}
              articleAuthorId={article?.author?.id}
            />
          </div>
        </div>
      </article>

      {/* Report Popup Modal */}
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
              placeholder="Provide more details..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setIsReportOpen(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
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
  </>
  );
}