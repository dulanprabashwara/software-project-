"use client";

import {
  BadgeCheck,
  MessageCircle,
  Star,
  Bookmark,
  MoreHorizontal,
  Clock
} from "lucide-react";

// Displays a single article preview card in lists
export default function ArticleCard({ article }) {
  return (
    <article className="py-6 border-b border-[#E5E7EB] last:border-0">
      {/* Author info */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={article.authorAvatar}
          alt={article.authorName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-[#111827]">
          {article.authorName}
        </span>

        {article.verified && (
          <BadgeCheck className="w-4 h-4 text-[#1ABC9C]" />
        )}

        <span className="text-sm text-[#6B7280] flex">·<Clock className="wi-4 h-4 mt-1"/> {article.date}</span>
      </div>

      {/* Article content */}
      <div className="flex gap-6 justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#111827] mb-2 leading-tight font-serif hover:text-[#1ABC9C] transition-colors duration-150 cursor-pointer">
            {article.title}
          </h2>

          <div className="text-[#6B7280] text-base leading-relaxed line-clamp-3">
            <div
              dangerouslySetInnerHTML={{
                __html: article.content, // already sanitized HTML
              }}
            />
          </div>
        </div>

        {/* Thumbnail */}
        {article.thumbnail && (
          <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          {/* Comments */}
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span><p>--</p></span>
          </button>

          {/* Rating/Likes */}
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <Star className="w-5 h-5" strokeWidth={1.5} />
            <span> <p>--</p></span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <button className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150">
            <Bookmark
              className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150"
              strokeWidth={1.5}
            />
          </button>

          {/* More options */}
          <button className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150">
            <MoreHorizontal className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150" />
          </button>
        </div>
      </div>
    </article>
  );
}
