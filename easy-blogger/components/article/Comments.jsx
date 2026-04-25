"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useComments } from "../../hooks/useComments";
// Import the ratings hook
import { useArticleRatings } from "../../hooks/useArticleRatings";

export const Comments = ({ articleId, token }) => {
  // 1. Guard against missing ID
  if (!articleId) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin text-teal-500" />
      </div>
    );
  }

  const { comments, loading, addComment, submitRating } = useComments(articleId, token);
  const { articleRatings } = useArticleRatings(); // Fetch current user's ratings

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Loading States
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Local rating state for display and optimistic updates
  const [localRating, setLocalRating] = useState(0);

  // Helper to check if we are actually logged in
  const isAuthenticated = !!token;

  // Find the user's rating for THIS specific article when data loads
  useEffect(() => {
    if (articleRatings?.length > 0 && articleId) {
      const existingRating = articleRatings.find(r => r.articleId === articleId);
      if (existingRating) {
        setLocalRating(existingRating.score);
      }
    }
  }, [articleRatings, articleId]);

  // EXECUTE: Send main comment to backend
  const onPost = async () => {
    if (!text.trim()) return;
    if (!isAuthenticated) return alert("Please log in to comment");
    
    setIsPostingComment(true);
    try {
      const ok = await addComment(text); 
      if (ok) setText(""); 
    } finally {
      setIsPostingComment(false);
    }
  };

  // EXECUTE: Send reply to backend
  const onReply = async (parentId) => {
    if (!replyText.trim()) return;
    if (!isAuthenticated) return alert("Please log in to reply");

    setIsPostingComment(true);
    try {
      const ok = await addComment(replyText, parentId); 
      if (ok) {
        setReplyTo(null);
        setReplyText(""); 
      }
    } finally {
      setIsPostingComment(false);
    }
  };

  // EXECUTE: Send rating (1-5) to backend
  const onRate = async (num) => {
    if (!isAuthenticated) return alert("Please log in to rate");
    
    // Optimistic UI update
    const previousRating = localRating;
    setLocalRating(num);
    setIsSubmittingRating(true);
    
    try {
      await submitRating(num); 
    } catch (err) {
      console.error("Rating failed:", err);
      // Revert the stars if the backend request fails
      setLocalRating(previousRating);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* RATING SECTION */}
      <div className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50">
        <span className="text-sm font-bold text-gray-600">Rate this article:</span>
        <div className="flex gap-1">
          <Star 
            size={24} 
            onClick={() => onRate(1)} 
            className={`cursor-pointer transition ${localRating >= 1 ? "fill-teal-500 text-teal-500" : "text-gray-300 hover:text-teal-400"}`} 
          />
          <Star 
            size={24} 
            onClick={() => onRate(2)} 
            className={`cursor-pointer transition ${localRating >= 2 ? "fill-teal-500 text-teal-500" : "text-gray-300 hover:text-teal-400"}`} 
          />
          <Star 
            size={24} 
            onClick={() => onRate(3)} 
            className={`cursor-pointer transition ${localRating >= 3 ? "fill-teal-500 text-teal-500" : "text-gray-300 hover:text-teal-400"}`} 
          />
          <Star 
            size={24} 
            onClick={() => onRate(4)} 
            className={`cursor-pointer transition ${localRating >= 4 ? "fill-teal-500 text-teal-500" : "text-gray-300 hover:text-teal-400"}`} 
          />
          <Star 
            size={24} 
            onClick={() => onRate(5)} 
            className={`cursor-pointer transition ${localRating >= 5 ? "fill-teal-500 text-teal-500" : "text-gray-300 hover:text-teal-400"}`} 
          />
        </div>
        
        {/* Rating Loading Message */}
        {isSubmittingRating && (
          <span className="text-xs text-teal-500 animate-pulse font-medium">Submitting rating...</span>
        )}
      </div>

      {/* POST COMMENT SECTION */}
      <div>
        <div className="flex justify-between items-end mb-2">
          {/* Comment Loading Message */}
          {isPostingComment && (
            <span className="text-sm text-teal-500 animate-pulse font-medium">Posting comment...</span>
          )}
        </div>
        
        <div className="flex gap-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAuthenticated ? "Add a comment..." : "Log in to join the conversation"}
            disabled={!isAuthenticated || isPostingComment}
            className="flex-1 border-b border-gray-300 p-2 outline-none focus:border-teal-500 disabled:bg-transparent disabled:placeholder-gray-400"
          />
          <button 
            onClick={onPost}
            disabled={!isAuthenticated || !text.trim() || isPostingComment}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </div>

      {/* COMMENTS LIST */}
      <div className="space-y-6">
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-teal-500" />
          </div>
        ) : (
          comments.filter(c => !c.parentId).map((comment) => (
            <div key={comment.id} className="border-l-2 border-gray-100 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">{comment.author?.displayName || "Anonymous"}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
              
              <button 
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-xs text-teal-600 mt-2 hover:underline"
              >
                {replyTo === comment.id ? "Cancel" : "Reply"}
              </button>

              {/* REPLIES SECTION */}
              <div className="ml-6 mt-4 space-y-4">
                {comments.filter(r => r.parentId === comment.id).map(reply => (
                  <div key={reply.id} className="bg-gray-50 p-2 rounded">
                    <span className="font-bold text-xs">{reply.author?.displayName || "Anonymous"}</span>
                    <p className="text-sm text-gray-600">{reply.content}</p>
                  </div>
                ))}

                {replyTo === comment.id && (
                  <div className="flex gap-2 mt-2">
                    <input 
                      autoFocus
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)} 
                      disabled={isPostingComment}
                      placeholder="Write a reply..."
                      className="flex-1 text-sm border-b outline-none focus:border-teal-500 disabled:bg-transparent"
                    />
                    <button 
                      onClick={() => onReply(comment.id)}
                      disabled={!replyText.trim() || isPostingComment}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 disabled:text-gray-400"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};