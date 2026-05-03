"use client";

import { useRouter } from "next/navigation";
import { useTrending } from "../../hooks/useTrendingTitles";
import { usePopularTags } from "../../hooks/usePopularTags";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function RightFeed() {
  const router = useRouter();
  const { trending, isTrendingLoading } = useTrending();
  const { tags, isLoading: isTagsLoading } = usePopularTags(10);

  return (
    <aside className="border-l border-[#e5e7eb] shrink-0 p-8">
      {/* Trending Section */}
      <div className="mb-10">
       <Link href='/stats/public'> <h3 className="font-bold mb-4 font-serif">Trending</h3></Link>
        {isTrendingLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
        ) : (
          trending.map((item, i) => (
            <div 
              key={i} 
              className="flex gap-3 mb-4 group cursor-pointer"
              onClick={() => router.push(`/home/read?id=${item.id}`)}
            >
              <span className="text-xl font-bold text-gray-200 group-hover:text-teal-500 transition-colors">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-teal-500 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500">{item.author?.displayName || "Unknown"}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Topics Section */}
      <div className="mb-10">
        <h3 className="font-bold mb-4 font-serif">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {isTagsLoading ? (
             <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
          ) : (
            tags.map((tag) => (
              <Link
  key={tag.name}
  href={`/home?q=${tag.name}`}
  className="px-3 py-1 bg-gray-50 border rounded-full text-xs hover:bg-teal-500 hover:text-white transition capitalize inline-block"
>
  {tag.name}
</Link>
            ))
          )}
        </div>
      </div>

      
    </aside>
  );
}