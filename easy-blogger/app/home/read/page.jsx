"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Star,
  MessageCircle,
  CalendarDays,
  Bookmark,
} from "lucide-react";
import { DATA } from "../../../components/article/ArticleList";

export default function Page() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const article = useMemo(
    () => DATA.articles.find((a) => a.id === id),
    [id]
  );

  const [saved, setSaved] = useState(false);

  if (!id || !article) {
    return <div className="p-8">Article not found</div>;
  }

  return (
    <div className="h-full overflow-hidden bg-white">
      <article className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-10">

          {/* AUTHOR ROW */}
          <div className="flex items-center gap-4">
            <img
              src={article.authorAvatar}
              alt={article.authorName}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {article.authorName}
              </span>

              {article.verified && (
                <BadgeCheck className="w-5 h-5 text-teal-500" />
              )}
            </div>

            <button className="ml-4 px-4 py-1 rounded-full border border-teal-400 text-teal-600 text-sm hover:bg-teal-50 transition">
              Follow
            </button>
          </div>

          {/* TITLE */}
          <h1 className="mt-8 text-5xl md:text-6xl font-black font-serif leading-tight tracking-tight">
            {article.title}
          </h1>

         <img
  src={article.thumbnail}
  alt={article.title}
  className="w-full h-[260px] object-cover rounded-sm"
/>


          {/* META ROW */}
          <div className="mt-4 flex items-center justify-between border-b border-gray-300 pb-3 text-gray-600 text-sm">
            <div className="flex items-center gap-8">

              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>{article.likes}</span>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>{article.comments}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                <span>{article.date}</span>
              </div>

            </div>

            <button
              onClick={() => setSaved((p) => !p)}
              className="hover:bg-gray-100 p-2 rounded-full transition"
            >
              <Bookmark
                className={`w-5 h-5 ${
                  saved ? "fill-black text-black" : ""
                }`}
              />
            </button>
          </div>

          
          {/* CONTENT (HTML from editor like TinyMCE) */}
          <div
            className="mt-8 prose prose-lg max-w-none prose-p:leading-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />


        </div>
      </article>
    </div>
  );
}
