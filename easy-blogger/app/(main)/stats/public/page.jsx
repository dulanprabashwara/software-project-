"use client";

import { TrendingUp,Search } from 'lucide-react';

import TrendingArticleCard from "../../../../components/article/TrendingArticleCard";
import { DATA } from "../../../../components/article/ArticleList";
import {topics} from "../../../../components/article/Topics";
import TopTopicsChart from "../../../../components/TopTopicsChart";

export default function PublicStats() {
 
  return (
    <div>

         
    <div className="w-full bg-[#f0fdf9] p-4 rounded-[2rem] mb-10">

         
      
      <div className="py-1 mb-2 text-[1.75rem] font-[Georgia] flex text-[#6b6b6b]">
         <TrendingUp className='mt-3 mr-3 text-[#1abc9c]' />
        <h1>Trending Articles</h1>
      </div>
         
        

      <section>
       
        
          <div className="flex gap-5 overflow-x-auto bg-white p-3 rounded-[1rem] mb-3 ">
            {DATA.trending.map((article) => (
              <div key={article.id} className=" bg-white w-160 shrink-0 px-4 border-2 rounded-[1rem] border-[#e5e7eb]">
                <TrendingArticleCard article={article} />
              </div>
            ))}  
          </div>
         
      </section>

      

    </div>

    <div className="w-full bg-[#f0fdf9] p-4 mb-10 font-[Goergia] rounded-[2rem]">

         
      
      <div className="py-1 mb-2 text-[1.75rem] flex text-[#6b6b6b]">
         <Search className='mt-3 mr-3 text-[#1abc9c]' />
        <h1>Recommended Topics</h1>
      </div>
         
        <div className="py-8">
      <TopTopicsChart />
    </div>

     <section className='flex flex-wrap gap-17'>
         
                {topics.map((topic) => (
    <button
      key={topic.id}
      className="bg-white border-2 border-[#1abc9c] text-[#1abc9c] px-5 w-50 py-2 rounded-[1rem] text-[1.5rem]"
    >
      {topic.name}
    </button>
  ))}

        
  
</section>
<div className="text-right">
  <button className="bg-[#1abc9c] border-2 border-[white] text-white px-5  py-2 rounded-[1rem] text-[1rem]"> 
    More
  </button>
</div>
      

    </div>
    </div>
  );
}
