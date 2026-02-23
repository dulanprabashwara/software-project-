"use client";

import DraftArticleCard from "../../../../components/article/DraftArticleCard";
import { DATA } from "../../../../components/article/ArticleList";

export default function Unpublished() {
  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl   w-full">
        {DATA.draftArticles.map((article) => (
          <DraftArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
