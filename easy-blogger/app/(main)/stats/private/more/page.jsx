'use client';

import { useState } from 'react';
import { useArticleStats } from '../../../../../hooks/useArticleStats';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MoreStatsPage() {
    const { stats, isLoading, error } = useArticleStats();
    const router = useRouter();
    const [selectedArticleId, setSelectedArticleId] = useState(null);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1ABC9C]" />
            </div>
        );
    }

    if (error) {
        return <div className="p-10 text-red-500">Error loading stats: {error}</div>;
    }

    // Default to the first article if none selected
    const activeArticleId = selectedArticleId || (stats?.length > 0 ? stats[0].id : null);
    const activeArticle = stats?.find(a => a.id === activeArticleId);

    // Calculate rating breakdown
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (activeArticle && activeArticle.ratings) {
        activeArticle.ratings.forEach(r => {
            if (r.score >= 1 && r.score <= 5) {
                ratingCounts[r.score]++;
            }
        });
    }

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] p-6 font-[Georgia]">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 w-fit cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Stats
            </button>
            
            <div className="flex gap-6 h-[calc(100vh-150px)]">
                {/* Left side: List of articles */}
                <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto p-4 flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Your Articles</h2>
                    {stats?.map(article => (
                        <div 
                            key={article.id}
                            onClick={() => setSelectedArticleId(article.id)}
                            className={`p-4 rounded-xl cursor-pointer transition-colors ${activeArticleId === article.id ? 'bg-[#1abc9c] text-white' : 'hover:bg-gray-50 text-gray-700 border border-gray-100'}`}
                        >
                            <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                            <p className={`text-sm mt-2 ${activeArticleId === article.id ? 'text-teal-100' : 'text-gray-500'}`}>
                                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Draft'}
                            </p>
                        </div>
                    ))}
                    {stats?.length === 0 && <p className="text-gray-500 p-2">No articles found.</p>}
                </div>

                {/* Right side: Detailed Stats */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto p-8">
                    {activeArticle ? (
                        <div className="flex flex-col gap-8">
                            <h2 className="text-2xl font-bold text-gray-800">{activeArticle.title}</h2>
                            
                            {/* Stats Overview */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-gray-500 text-sm">Average Rating</p>
                                    <p className="text-3xl font-bold text-[#1abc9c]">{activeArticle.averageRating?.toFixed(1) || "0.0"}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-gray-500 text-sm">Total Ratings</p>
                                    <p className="text-3xl font-bold text-gray-700">{activeArticle.ratingCount || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-gray-500 text-sm">Total Reads</p>
                                    <p className="text-3xl font-bold text-gray-700">{activeArticle.readCount || 0}</p>
                                </div>
                            </div>

                            {/* Ratings Breakdown */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Rating Breakdown</h3>
                                <div className="flex gap-4 flex-wrap">
                                    {[5, 4, 3, 2, 1].map(stars => (
                                        <div key={stars} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                            <span className="font-bold text-gray-700">{stars} Star</span>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-[#1abc9c] font-semibold">{ratingCounts[stars]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comments Table */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Comments</h3>
                                {activeArticle.comments && activeArticle.comments.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-3 border-b text-gray-600 font-semibold w-1/4 rounded-tl-lg">Name</th>
                                                <th className="p-3 border-b text-gray-600 font-semibold rounded-tr-lg">Comment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeArticle.comments.map(comment => (
                                                <tr key={comment.id} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="p-3 align-top font-medium text-gray-800">{comment.author?.displayName || 'Unknown'}</td>
                                                    <td className="p-3 text-gray-600 whitespace-pre-wrap">{comment.content}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500 italic">No comments yet.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            Select an article to view its detailed stats
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
