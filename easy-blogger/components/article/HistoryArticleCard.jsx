"use client";

import {
  BadgeCheck,
  MessageCircle,
  Star,
  Bookmark,
  MoreHorizontal,
  BookOpen,
} from "lucide-react";

export default function HistoryArticleCard({
  article,
  isOpen,
  onClick,
}) {
  return (
    <article
      onClick={onClick}
      className={`cursor-pointer border-b border-[#E5E7EB] last:border-0 transition-all duration-600 ${
        isOpen ? "py-6" : "py-3"
      }`}
    >
      {/* Author */}
      <div className={`flex items-center gap-2 ${isOpen ? "mb-3" : "mb-1"}`}>
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

        <span className="text-sm text-[#6B7280]">· {article.date}</span>
      </div>

      {/* Title + Content */}
      <div className={`flex justify-between ${isOpen ? "gap-6" : "gap-3"}`}>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[#111827] leading-tight font-serif hover:text-[#1ABC9C] transition-colors duration-150">
            {article.title}
          </h2>

          {/* Preview only when open */}
          {isOpen && (
            <div className="text-[#6B7280] text-base leading-relaxed transition-all duration- 300 line-clamp-3 mt-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: article.content,
                }}
              />
            </div>
          )}
        </div>

        {/* Thumbnail only when open */}
        {isOpen && article.thumbnail && (
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
      <div
        className={`flex items-center justify-between ${
          isOpen ? "mt-4" : "mt-2"
        }`}
      >
        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span>{article.comments}</span>
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150"
          >
            <Star className="w-5 h-5" strokeWidth={1.5} />
            <span>{article.likes}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span>{article.read}</span>
            <BookOpen className="w-5 h-5 mt-1" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => e.stopPropagation()}
            className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150"
          >
            <Bookmark
              className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150"
              strokeWidth={1.5}
            />
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150"
          >
            <MoreHorizontal className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150" />
          </button>
        </div>
      </div>
    </article>
  );
}
