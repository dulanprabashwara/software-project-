'use client';

import { Star, Loader2 } from 'lucide-react';
import ArticleCard from '../../../../components/article/ArticleCard';
// Import your new hook
import { useTopUserArticles } from '../../../../hooks/feeds/useTopUserArticles';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from "next/navigation";

export default function PrivateStats() {
    // Fetch data using the new hook
    const { articles, isLoading } = useTopUserArticles();
    const { userProfile } = useAuth();
    const router = useRouter();

    // The backend already sorts by trending score and limits to top 5
    const topArticles = articles || [];

    const totalRatings = topArticles.reduce((acc, curr) => acc + (curr.ratingCount || 0), 0);
    const avgRating = totalRatings > 0
      ? (topArticles.reduce((acc, curr) => acc + (curr.averageRating || 0) * (curr.ratingCount || 0), 0) / totalRatings).toFixed(1)
      : "0.0";

    return (
        <div className="overflow-hidden flex flex-col p-4">
            <div className="bg-[#f0fdf9] w-full rounded-4xl mb-10 gap-20 p-5 flex flex-col md:flex-row">
                <div className="flex gap-7 flex-col font-serif shrink-0">
                    <div className="flex gap-3">
                        <Star className="fill-brand-primary text-[#f0fdf9] pb-2 stroke-1 w-13 h-13" />
                        <h1 className="text-[1.75rem] text-brand-muted">Ratings</h1>
                    </div>
                    <div className="bg-white p-5 h-50 w-70 rounded-2xl shadow-sm flex items-center justify-center">
                        <div className="flex flex-col">
                            <img src={userProfile?.avatarUrl || "https://i.pravatar.cc/150?img=47"}
                                alt="image_User" className="rounded-full w-30 h-30 overflow-hidden mx-auto object-cover" />
                            <h1 className="pt-3 font-bold text-[1.5rem] text-center text-[#4a4a4a]">
                                {userProfile?.displayName || "User"}
                            </h1>
                        </div>
                    </div>
                    <div className="bg-white pl-5 py-4 rounded-2xl shadow-sm">
                        <p className="text-[4rem] leading-tight text-brand-primary">{avgRating}</p>
                        <p className="text-[1.25rem] text-brand-muted">Average Score</p>
                        <div className="flex text-[1rem] text-brand-muted">
                            <p>{totalRatings} . rates</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-5 flex-col overflow-hidden flex-1">
                    <div className="px-5 pt-2 flex justify-between font-serif">
                        <h1 className="font-bold px-5 rounded-2xl text-brand-muted">{"<<"} High</h1>
                        <h1 className="font-bold px-5 rounded-2xl text-brand-muted">Low {">>"}</h1>
                    </div>

                    {isLoading ? (
                        <div className="flex w-full items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        </div>
                    ) : (
                        <div className="flex gap-5 overflow-x-auto bg-white p-3 rounded-2xl mb-3 items-start">
                            {topArticles.map((article) => {
                                // Provide default author to ArticleCard so it displays the user profile
                                const articleWithAuthor = {
                                    ...article,
                                    author: {
                                        displayName: userProfile?.displayName,
                                        avatarUrl: userProfile?.avatarUrl,
                                        username: userProfile?.username,
                                        id: userProfile?.id
                                    }
                                };
                                return (
                                    <div key={article.id} className="bg-white w-160 shrink-0 px-4 border-2 rounded-2xl border-[#e5e7eb] h-fit">
                                        <ArticleCard article={articleWithAuthor} />
                                    </div>
                                );
                            })}
                            {topArticles.length === 0 && <p className="text-gray-400 p-4">No articles found.</p>}
                        </div>
                    )}

                    <div className="flex justify-end mt-4">
                        <button
                            className="bg-white border-2 border-brand-primary font-serif px-5 py-2 rounded-2xl text-brand-primary cursor-pointer transition-colors hover:bg-brand-primary hover:text-white"
                            onClick={() => router.push('/stats/private/more')}
                        >
                            See More
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Article Stats Table */}
            <div className="bg-[#f0fdf9] rounded-4xl w-full p-8 font-serif">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[1.5rem] text-brand-muted font-bold">Article Performance</h2>
                    {isLoading && <Loader2 className="animate-spin text-brand-primary w-5 h-5" />}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-brand-muted text-[1.1rem]">
                                <th className="pb-4  pl-4 font-bold">Article</th>
                                <th className="pb-4 font-bold text-center">Published Date</th>
                                <th className="pb-4 font-bold text-center">Comments</th>
                                <th className="pb-4 font-bold text-center">Rate Score</th>
                                <th className="pb-4 pr-4 font-bold text-center">Reads</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {/* Map through the topArticles array */}
                            {!isLoading && topArticles.length > 0 ? (
                                topArticles.map((article) => (
                                    <tr key={article.id}
                                    className="group hover:bg-teal-50 transition-colors cursor-pointer transition-transform hover:scale-102 duration-200"
                                     onClick={() => router.push(`/home/read?id=${article.id}`)} >
                                        <td className="py-5 pl-4 rounded-l-2xl border-y border-l border-gray-100">
                                            <p className="font-bold text-[#4a4a4a] truncate max-w-xs">
                                                {article.title}
                                            </p>
                                        </td>
                                        <td className="py-5 text-center border-y border-gray-100 text-brand-muted">
                                            {article.publishedAt
                                                ? new Date(article.publishedAt).toLocaleDateString()
                                                : "Draft"}
                                        </td>
                                        <td className="py-5 text-center border-y border-gray-100 font-bold text-brand-primary">
                                            {article.commentCount || 0}
                                        </td>
                                        <td className="py-5 text-center border-y border-gray-100">
                                            <span className="text-brand-primary font-bold">
                                                {article.averageRating?.toFixed(1) || "0.0"}
                                            </span>
                                            <span className="text-gray-400 text-sm ml-1">
                                                ({article.ratingCount || 0})
                                            </span>
                                        </td>
                                        <td className="py-5 pr-4 text-center rounded-r-2xl border-y border-r border-gray-100 font-bold text-brand-muted">
                                            {(article.readCount || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : !isLoading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">
                                        No articles found yet.
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