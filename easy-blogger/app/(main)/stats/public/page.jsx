"use client";

import SavedArticleCard from "../../../../components/article/SavedArticleCard";
import { DATA } from "../../../../components/article/ArticleList";


export default function PublicStats() {
  return (
    <div className="w-full bg-blue-300 p-4">
      
      <div>
        <h1>Trending Articles</h1>
      </div>

        <div className="flex flex-col">
             <section className="px-8 min-w-0">
            <div className="max-w-3xl   w-full">
              {DATA.savedArticles.map((article) => (
                <SavedArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </div>
     

      {/* Right aligned button */}
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-black text-white rounded">
          Explore
        </button>
      </div>

    </div>
  );
}
