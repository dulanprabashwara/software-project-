"use client";
import DOMPurify from "dompurify";


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
          <svg
            className="w-4 h-4 text-[#1ABC9C]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className="text-sm text-[#6B7280]">· {article.date}</span>
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
                __html: DOMPurify.sanitize(article.content),
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{article.comments}</span>
          </button>

          {/* Rating/Likes */}
          <button className="flex items-center gap-1.5 hover:text-[#1ABC9C] transition-colors duration-150">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span>{article.likes}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <button className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150">
            <svg
              className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>

          {/* More options */}
          <button className="group p-2 hover:bg-[#E8F8F5] rounded-full transition-colors duration-150">
            <svg
              className="w-5 h-5 text-[#6B7280] group-hover:text-[#1ABC9C] transition-colors duration-150"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
