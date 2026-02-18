"use client";

import ArticleCard from "./ArticleCard";

export default function MainFeed({ articles, sidebarOpen }) {
  return (
    <section
      className={`flex-1 min-h-0 overflow-y-auto px-6   border-r border-[#e5e7eb] transition-all n ? "ml-64" : "ml-0"
      }`}
    >
      <div className="max-w-full mx-auto">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
