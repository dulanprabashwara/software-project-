"use client";

import { TrendingUp,Search} from 'lucide-react';
import TrendingArticles from '../../../../components/article/TrendingArticles';
import { usePopularTags } from "../../../../hooks/usePopularTags";
import TopTopicsChart from "../../../../components/TopTopicsChart";



export default function PublicStats() {

  const { tags, isLoading } = usePopularTags();


  return (
    <div>


    <div className="w-full bg-[#f0fdf9] p-4 rounded-4xl mb-10">



      <div className="py-1 mb-2 text-[1.75rem] font-serif flex text-brand-muted">
         <TrendingUp className='mt-3 mr-3 text-brand-primary' />
        <h1>Trending Articles</h1>
      </div>
          <TrendingArticles/>
      </div>

    <div className="w-full bg-[#f0fdf9] p-4 mb-10 font-[Goergia] rounded-4xl">



      <div className="py-1 mb-2 text-[1.75rem] flex text-brand-muted">
         <Search className='mt-3 mr-3 text-brand-primary' />
        <h1>Recommended Topics</h1>
      </div>

        <div className="py-8">
      <TopTopicsChart />
    </div>

    <section className='flex flex-wrap gap-17'>

      {tags.map((topic) => (
      <button
        key={topic.name}
        className="bg-white border-2 border-brand-primary text-brand-primary px-5 w-50 py-2 rounded-2xl text-[1.5rem]"
      >
        {topic.name}
      </button>
    ))}
    </section>
<div className="text-right">
  <button className="bg-brand-primary border-2 border-[white] text-white px-5  py-2 rounded-2xl text-[1rem]">
    More
  </button>
</div>


    </div>
    </div>
  );
}
