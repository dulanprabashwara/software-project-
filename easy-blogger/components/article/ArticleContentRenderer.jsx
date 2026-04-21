"use client";

export default function ArticleContentRenderer({ content, className = "" }) {
  return (
    <div
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content || "" }}
    />
  );
}