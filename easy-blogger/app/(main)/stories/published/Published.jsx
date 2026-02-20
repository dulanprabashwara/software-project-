"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { DATA } from "../../../../components/article/ArticleList";

export default function Published() {
  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl   w-full">
        {DATA.publishedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
