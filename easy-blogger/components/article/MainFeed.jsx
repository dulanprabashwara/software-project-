"use client";

import ArticleCard from "./ArticleCard";

export default function MainFeed({ articles, sidebarOpen }) {
  return (
    <section
      className={`flex-1 overflow-y-auto px-6 py-8 border-r border-[#e5e7eb] transition-all n ? "ml-64" : "ml-0"
      }`}
    >
      <div className="max-w-[700px] mx-auto">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
