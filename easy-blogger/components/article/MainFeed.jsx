"use client";

import { useRouter } from "next/navigation";
import ArticleCard from "./ArticleCard";

export default function MainFeed({ articles }) {
  // Check: Is 'articles' actually an array here?
 
  if (!articles || articles.length === 0) return <p>No articles found.</p>;
   return (
    <div>
      {articles.map((item) => (
        <ArticleCard key={item.id || item._id} article={item} />
      ))}
    </div>
  );
}
