// components/article/TrendingArticles.jsx
"use client";

import ArticleCard from './ArticleCard';
import { useTrendingArticles } from '../../hooks/useTrendingArticles';
import { useSavedList } from '../../hooks/useSavedArticles';
import { Loader2 } from 'lucide-react';
 
export default function TrendingArticles() {

const { trending, isTrendingLoading } = useTrendingArticles();
const{savedList} = useSavedList();
  if (isTrendingLoading && trending.length === 0) {
    return (
      <div className="flex w-full items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
      </div>
    );
  }

  return (
    // Note: Added 'items-start' to prevent the cards from stretching downwards
    <div className="flex gap-5 overflow-x-auto bg-white p-3 rounded-2xl mb-3 items-start">
      {trending.map((article) => (
        // Note: Added 'h-fit' to ensure the white border hugs the card tightly
        <div 
          key={article.id} 
          className="bg-white w-160 shrink-0 px-4 border-2 rounded-2xl border-[#e5e7eb] h-fit"
        >
          <ArticleCard 
          article={article}
          savedArticles={savedList}
          />
        </div>
      ))}  
    </div>
  );
}