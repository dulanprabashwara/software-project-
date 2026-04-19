"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, BadgeCheck, Star, MessageCircle, CalendarDays, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useArticle } from "../../../hooks/useArticle";
import { Comments } from "../../../components/article/Comments";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const { user, userProfile, loading: authLoading } = useAuth();
  const { article, isLoading: articleLoading, error } = useArticle(id);
  const [token, setToken] = useState(null);

  // Sync Firebase JWT to state for the Comments component
  useEffect(() => {
    if (user) {
      user.getIdToken().then((t) => setToken(t));
    } else {
      setToken(null);
    }
  }, [user]);

  // Scroll logic for sticky header
  const [showCompact, setShowCompact] = useState(false);
  const scrollRef = useRef(null);
  const coverRef = useRef(null);

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

  if (articleLoading || authLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
    </div>
  );

  if (error || !article) return <div className="p-8 text-center">Article not found</div>;

  return (
    <div className="h-full overflow-hidden bg-white">
      <article ref={scrollRef} className="h-full overflow-y-auto scroll-smooth">
        
        {/* Sticky Header */}
        <div className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-all ${
          showCompact ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}>
          <div className="max-w-5xl mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={article.author?.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
              <h2 className="font-serif font-black truncate max-w-[200px]">{article.title}</h2>
            </div>
            <MoreHorizontal className="text-gray-400" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 md:px-12 py-10">
          {/* Author & Title */}
          <div className="flex items-center gap-4 mb-8">
            <img src={article.author?.avatarUrl} className="w-12 h-12 rounded-full" alt="" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{article.author?.displayName}</span>
                {article.author?.role === "ADMIN" && <BadgeCheck className="w-4 h-4 text-teal-500" />}
              </div>
              <p className="text-xs text-gray-500">Software Developer</p>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-serif mb-6">{article.title}</h1>

          <img ref={coverRef} src={article.coverImage} className="w-full h-[450px] object-cover rounded-xl mb-10" alt="" />

          <div className="prose prose-teal prose-lg max-w-none mb-20" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Engagement Section */}
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
    </div>
  );
}