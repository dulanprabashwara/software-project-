import { Star } from 'lucide-react';
import FollowerGrowthChart from "../../../../components/FollowerGrowthChart";
import TrendingArticles from "../../../../components/article/TrendingArticles";


export default function PrivateStats()
{
    return (
            <div className="overflow-hidden flex flex-col">
                <div className="bg-[#f0fdf9] w-full rounded-4xl mb-10 gap-20 p-5 flex">
                    <div className="flex gap-7 flex-col font-[Georgia]">
                        <div className=" flex gap-3  ">
                            <Star className="fill-[#1abc9c] text-[#f0fdf9] pb-2 stroke-1 w-13 h-13"/>
                            <h1 className="text-[1.75rem] text-[#6b6b6b]">Ratings</h1>
                        </div>
                        <div className="bg-white  p-5 h-50 w-70 rounded-2xl ">
                            <div className="flex flex-col">
                                <img src="https://i.pravatar.cc/150?img=47"
                                    alt="image_User" className="rounded-full w-30 h-30 overflow-hidden mx-auto"/>
                            <h1 className="pt-3 font-bold text-[1.5rem] text-center">
                                Emma Richardson
                            </h1>
                            </div>
                            
                        </div>
                        <div className="bg-white pl-2 rounded-2xl">
                            <p className="text-[4rem] text-[#1abc9c]">
                                4.2
                            </p>
                            <p className="text-[1.25rem]">
                                Average Score
                            </p>
                            <div className="flex text-[1rem] text-[#6b6b6b] ">
                                <p>
                                322
                                </p>
                                <p>
                                    . 
                                </p>
                                <p>
                                    rates
                                </p>
                            </div>
                            
                        </div>
                    </div>

                    <div className="flex gap-5 flex-col overflow-hidden flex-1  ">
                        <div className=" px-5 pt-2 flex justify-between font-[Georgia] ">
                            <h1 className=" font-bold px-5 rounded-2xl text-[#6b6b6b]">
                                {"<<"}High
                            </h1>

                            <h1 className=" font-bold  px-5 rounded-2xl text-[#6b6b6b]">
                                Low {">>"}
                            </h1>
                        </div>

                         <TrendingArticles/>
                        
                        
                            <div className="flex justify-end mt-18">
                            <button className=" bg-white border-2 border-[#1abc9c] font-[Georgia] px-5 py-2 rounded-2xl text-[#1abc9c] ">
                                See More
                            </button>
                        </div>

                    </div>

                    


                </div>

                <div className="bg-[#f0fdf9] rounded-4xl w-full">
                    <div className="p-8">
                        <FollowerGrowthChart />
                    </div>
                </div>
            </div>
        
    )
}