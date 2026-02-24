"use client";

import { useRouter } from "next/navigation";
import ArticleCard from "./ArticleCard";

export default function MainFeed({ articles }) {
  const router = useRouter();

  return (
    <section className="flex-1 relative px-8 min-w-0 z-0">
      <div className="max-w-3xl mx-auto w-full">
        {articles.map((article) => (
          <div
            key={article.id}
           
            
          >
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </section>
  );
}
