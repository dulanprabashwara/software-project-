"use client";

import ScheduledArticleCard from "../../../../components/article/ScheduledArticleCard";
import { DATA } from "../../../../components/article/ArticleList";

export default function Scheduled() {
  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl   w-full">
        {DATA.scheduledArticles.map((article) => (
          <ScheduledArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
