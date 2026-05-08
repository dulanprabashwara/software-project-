'use client';

import { Star, Loader2 } from 'lucide-react';
import TrendingArticles from "../../../../components/article/TrendingArticles";
import { useArticleStats } from '../../../../hooks/useArticleStats';
import { useRouter } from "next/navigation";

export default function PrivateStats() {
    // 1. Fetch real data using your hook
    const { stats, isLoading, error } = useArticleStats();
    const router = useRouter();
    

    return (
        <div className="overflow-hidden flex flex-col p-4">
            <div className="bg-[#f0fdf9] w-full rounded-4xl mb-10 gap-20 p-5 flex">
                <div className="flex gap-7 flex-col font-[Georgia]">
                    <div className="flex gap-3">
                        <Star className="fill-[#1abc9c] text-[#f0fdf9] pb-2 stroke-1 w-13 h-13" />
                        <h1 className="text-[1.75rem] text-[#6b6b6b]">Ratings</h1>
                    </div>
                    <div className="bg-white p-5 h-50 w-70 rounded-2xl shadow-sm">
                        <div className="flex flex-col">
                            <img src="https://i.pravatar.cc/150?img=47"
                                alt="image_User" className="rounded-full w-30 h-30 overflow-hidden mx-auto" />
                            <h1 className="pt-3 font-bold text-[1.5rem] text-center text-[#4a4a4a]">
                                Emma Richardson
                            </h1>
                        </div>
                    </div>
                    {/* Note: These could also be derived from the 'stats' array later */}
                    <div className="bg-white pl-5 py-4 rounded-2xl shadow-sm">
                        <p className="text-[4rem] leading-tight text-[#1abc9c]">4.2</p>
                        <p className="text-[1.25rem] text-[#6b6b6b]">Average Score</p>
                        <div className="flex text-[1rem] text-[#6b6b6b]">
                            <p>322 . rates</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-5 flex-col overflow-hidden flex-1">
                    <div className="px-5 pt-2 flex justify-between font-[Georgia]">
                        <h1 className="font-bold px-5 rounded-2xl text-[#6b6b6b]">{"<<"} High</h1>
                        <h1 className="font-bold px-5 rounded-2xl text-[#6b6b6b]">Low {">>"}</h1>
                    </div>
                    <TrendingArticles />
                    <div className="flex justify-end mt-18">
                        <button className="bg-white border-2 border-[#1abc9c] font-[Georgia] px-5 py-2 rounded-2xl text-[#1abc9c] transition-colors hover:bg-[#1abc9c] hover:text-white">
                            See More
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Article Stats Table */}
            <div className="bg-[#f0fdf9] rounded-4xl w-full p-8 font-[Georgia]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[1.5rem] text-[#6b6b6b] font-bold">Article Performance</h2>
                    {isLoading && <Loader2 className="animate-spin text-teal-500 w-5 h-5" />}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[#6b6b6b] text-[1.1rem]">
                                <th className="pb-4  pl-4 font-bold">Article</th>
                                <th className="pb-4 font-bold text-center">Published Date</th>
                                <th className="pb-4 font-bold text-center">Comments</th>
                                <th className="pb-4 font-bold text-center">Rate Score</th>
                                <th className="pb-4 pr-4 font-bold text-center">Reads</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {/*Map through the stats array */}
                            {!isLoading && stats.length > 0 ? (
                                stats.map((article) => (
                                    <tr key={article.id} 
                                    className="group hover:bg-teal-50 transition-colors cursor-pointer transition-colors transition-transform hover:scale-102 duration-200"
                                     onClick={() => router.push(`/home/read?id=${article.id}`)} >
                                        <td className="py-5 pl-4 rounded-l-2xl border-y border-l border-gray-100">
                                            <p className="font-bold text-[#4a4a4a] truncate max-w-xs">
                                                {article.title}
                                            </p>
                                        </td>
                                        <td className="py-5 text-center border-y border-gray-100 text-[#6b6b6b]">
                                            {article.publishedAt 
                                                ? new Date(article.publishedAt).toLocaleDateString() 
                                                : "Draft"}
                                        </td>
                                        <td className="py-5 text-center border-y border-gray-100 font-bold text-[#1abc9c]">
                                            {article.commentCount || 0}
                                        </td>
                                        <td className="py-5 text-center border-y border-gray-100">
                                            <span className="text-[#1abc9c] font-bold">
                                                {article.averageRating?.toFixed(1) || "0.0"}
                                            </span>
                                            <span className="text-gray-400 text-sm ml-1">
                                                ({article.ratingCount || 0})
                                            </span>
                                        </td>
                                        <td className="py-5 pr-4 text-center rounded-r-2xl border-y border-r border-gray-100 font-bold text-[#6b6b6b]">
                                            {(article.readCount || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : !isLoading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">
                                        {error ? "Error loading stats" : "No articles found yet."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}