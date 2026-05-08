"use client";

import ArticleCard from "../../../../components/article/ArticleCard";
import { useReadHistory } from "../../../../hooks/feeds/useReadHistory";
import { useSavedList } from "../../../../hooks/feeds/useSavedArticles";
import { Loader2 } from "lucide-react";

export default function History() {
  //get history articles
  const { readHistory, isLoading: historyLoading } = useReadHistory();
  const { savedList} = useSavedList();

  const isLoading = historyLoading;

//still loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  //if no articles available
  if (!readHistory || readHistory.length === 0) {
    return (
      <div className="px-8 mt-10 text-center">
        <p className="text-gray-500 font-serif text-lg">Your reading history is empty.</p>
      </div>
    );
  }

  //map articles to articlecard
  return (
    <section className="px-8 min-w-0">
      <div className=" w-full">
         {readHistory.map((item) => (
          <ArticleCard 
            key={item.id} 
            article={item.article} 
            readHistory={readHistory} 
            savedArticles={savedList}
          />
        ))}
      </div>
    </section>
  );
}