"use client";

import { TrendingUp,Search} from 'lucide-react';
import TrendingArticles from '../../../../components/article/TrendingArticles';
import { usePopularTags } from "../../../../hooks/usePopularTags";
import TopTopicsChart from "../../../../components/TopTopicsChart";
import { useRouter } from "next/navigation";


export default function PublicStats() {

  const { tags, isLoading } = usePopularTags(12);
  const router = useRouter();


  return (
    <div className='scale-90'>

         
    <div className="w-full bg-[#f0fdf9] p-4 rounded-4xl mb-10">

         
      
      <div className="py-1 mb-2 text-[1.75rem] font-[Georgia] flex text-[#6b6b6b]">
         <TrendingUp className='mt-3 mr-3 text-[#1abc9c]' />
        <h1>Trending Articles</h1>
      </div>
          <TrendingArticles/>
      </div>

    <div className="w-full bg-[#f0fdf9] p-4 mb-10 font-[Goergia] rounded-4xl">

         
      
      <div className="py-1 mb-2 text-[1.75rem] flex text-[#6b6b6b]">
         <Search className='mt-3 mr-3 text-[#1abc9c]' />
        <h1>Recommended Topics</h1>
      </div>
         
        <div className="py-8">
      <TopTopicsChart />
    </div>

    <section className='flex flex-wrap gap-17'>
          
      {tags.map((topic) => (
      <button
        key={topic.name}
        onClick={() => router.push(`/home?q=${topic.name}`)}
        className="bg-white border-2 border-[#1abc9c] text-[#1abc9c] px-5 w-50 py-2 rounded-2xl text-[1.5rem] hover:bg-teal-500 hover:text-white transition capitalize"
      >
        {topic.name}
      </button>
    ))}
    </section>
 
      

    </div>
    </div>
  );
}
