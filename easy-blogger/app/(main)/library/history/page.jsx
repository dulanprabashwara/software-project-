"use client";

import { useState } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { useReadHistory } from "../../../../hooks/useReadHistory";
import { useSavedArticles } from "../../../../hooks/useSavedArticles";
import { Loader2 } from "lucide-react";

export default function History() {
  const { readHistory, isLoading: historyLoading } = useReadHistory();
  const { savedArticles, isLoading: savedLoading } = useSavedArticles();

  const isLoading = historyLoading || savedLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!readHistory || readHistory.length === 0) {
    return (
      <div className="px-8 mt-10 text-center">
        <p className="text-gray-500 font-serif text-lg">Your reading history is empty.</p>
      </div>
    );
  }

  return (
    <section className="px-8 min-w-0">
      <div className="max-w-3xl w-full">
        <h1 className="text-2xl font-black font-serif mb-6 mt-6">Reading History</h1>
        {readHistory.map((item) => (
          <ArticleCard 
            key={item.id} 
            // We pass the nested article object from the history record
            article={item.article} 
            readHistory={readHistory} 
            savedArticles={savedArticles}
          />
        ))}
      </div>
    </section>
  );
}