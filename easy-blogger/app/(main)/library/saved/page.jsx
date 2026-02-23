"use client";

import SavedArticleCard from "../../../../components/article/SavedArticleCard";
import { DATA } from "../../../../components/article/ArticleList";

export default function Saved() {
  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl   w-full">
        {DATA.savedArticles.map((article) => (
          <SavedArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
