import ArticleCard from './ArticleCard';
import { useTrendingArticles } from '../../hooks/useTrendingArticles';
import {Loader2} from 'lucide-react';


export default function TrendingArticles ()
{

const { trending, isTrendingLoading } = useTrendingArticles();
   if (isTrendingLoading && trending.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
      </div>
    );
  }

    return(

        <div className="flex gap-5 overflow-x-auto bg-white p-3 rounded-[1rem] mb-3 ">
                    {trending.map((article) => (
                      <div key={article.id} className=" bg-white w-160 shrink-0 px-4 border-2 rounded-[1rem] border-[#e5e7eb]">
                        <ArticleCard article={article} />
                      </div>
                    ))}  
        </div>
    )
}