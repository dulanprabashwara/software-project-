"use client";

import { useState } from "react";
import HistoryArticleCard from "../../../../components/article/HistoryArticleCard";
import { DATA } from "../../../../components/article/ArticleList";

export default function History() {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl w-full">
        {DATA.historyArticles.map((article) => (
          <HistoryArticleCard
            key={article.id}
            article={article}
            isOpen={openId === article.id /*function to get article ID for opened*/} 
            onClick={() =>
              setOpenId((prev) =>
                prev === article.id ? null : article.id
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
