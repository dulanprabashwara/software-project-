"use client";
import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, MessageCircle, Star, Bookmark, MoreHorizontal } from "lucide-react";

export default function ArticleCard({ article }) {
  const storageKey = useMemo(() => `saved:${article.id}`, [article.id]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
   const router = useRouter();

  // Load initial saved state (so refresh keeps it green)
  useEffect(() => {
    setSaved(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

 const toggleBookmark = async () => {
  const next = !saved;

  setSaved(next);
  localStorage.setItem(storageKey, next ? "1" : "0");

  try {
    setSaving(true);

    const res = await fetch("/api/saved-articles", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next ? { article } : { id: article.id }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
  } catch (err) {
    setSaved(!next);
    localStorage.setItem(storageKey, !next ? "1" : "0");
    alert(err.message || "Operation failed");
  } finally {
    setSaving(false);
  }
};
  return (
    <article className="py-6 border-b border-[#E5E7EB] last:border-0">
      <div className="flex items-center gap-2 mb-3">
        <img
          src={article.authorAvatar}
          alt={article.authorName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-[#111827]">{article.authorName}</span>

        {article.verified && <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" />}

        <span className="text-sm text-[#6B7280]">· {article.date}</span>
      </div>

      <div className="flex gap-6 justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#111827] mb-2 leading-tight font-serif hover:text-[#1ABC9C] cursor-pointer transition-colors duration-150  " 
          onClick={() => router.push(`/home/read?id=${article.id}`)}>
            {article.title}
          </h2>

          <div className="line-clamp-3">
            <div
              className="text-gray-500 text-[16px] leading-6 [&_*]:text-gray-500 [&_*]:text-[16px]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>

        {article.thumbnail && (
          <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span>{article.comments}</span>
          </button>

          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <Star className="w-5 h-5" strokeWidth={1.5} />
            <span>{article.likes}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <button
            type="button"
            onClick={toggleBookmark}
            disabled={saving}
            className={`group p-2 rounded-full transition-colors duration-150 ${
              saved ? "bg-white" : "hover:bg-[#E8F8F5]"
            } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
            aria-pressed={saved}
            title={saved ? "Saved" : "Save"}
          >
            <Bookmark
              className={`w-5 h-5 transition-colors duration-150 ${
                saved ? "text-white fill-[#1abc9c]" : "text-[#1abc9c] group-hover:text-[#1ABC9C]"
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