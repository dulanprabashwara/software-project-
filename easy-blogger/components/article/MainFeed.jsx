"use client";

import ArticleCard from "./ArticleCard";

export default function MainFeed({ articles }) {
  return (
    <section className="flex-1   relative px-8  min-w-0 z-0">
      <div className="max-w-3xl  mx-auto w-full">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
