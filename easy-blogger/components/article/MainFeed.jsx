"use client";

import ArticleCard from "./ArticleCard";

export default function MainFeed({ articles }) {
  return (
    <section className="flex-1 overflow-y-auto px-6 py-8 border-r">
      <div className="max-w-[700px] mx-auto">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
