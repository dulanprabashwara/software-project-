"use client";

export default function RightFeed({ trending, topics, usersToFollow }) {
  return (
    <aside className="hidden border-l border-[#e5e7eb] lg:block w-80 z-0 shrink-0  p-8">
      {/* Trending */}
      <div>
        <h3 className="font-bold mb-4 font-serif">Trending</h3>
        {trending.map((item, i) => (
          <div key={i} className="flex gap-3 mb-4 group cursor-pointer">
            <span className="text-xl font-bold text-gray-200 group-hover:text-teal-500">
              {i + 1}
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-teal-500">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500">{item.author}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div>
        <h3 className="font-bold mb-4 font-serif">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              className="px-3 py-1 bg-gray-50 border rounded-full text-xs hover:bg-teal-500 hover:text-white transition"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Who to follow */}
      <div className="mt-3">
        <h3 className="font-bold mb-4 font-serif">Who to follow</h3>
        {usersToFollow.map((user, i) => (
          <div key={i} className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <img src={user.avatar} className="w-8 h-8 rounded-full" alt={user.name} />
              <div className="truncate">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.bio}</p>
              </div>
            </div>
            <button className="text-xs border border-teal-500 text-teal-500 px-3 py-1 rounded-full hover:bg-teal-500 hover:text-white">
              Follow
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
