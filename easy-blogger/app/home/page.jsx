"use client";

import { useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import ArticleCard from "../../components/article/ArticleCard";

// 1. DATA OBJECT - Keeping it all in one place for easy management
const DATA = {
  articles: [
    { id: 1, authorName: "Emma Richardson", authorAvatar: "https://i.pravatar.cc/150?img=1", verified: false, date: "Dec 4, 2025", title: "How AI is Transforming Content Creation in 2025", description: "Explore the latest developments in artificial intelligence and how they are revolutionizing content...", thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop", comments: 42, likes: 4.8 },
    { id: 2, authorName: "Guinevere Beck", authorAvatar: "https://i.pravatar.cc/150?img=5", verified: true, date: "Oct 17, 2025", title: "Best Books to Read on your Summer Holiday", description: "Summer always lies to us. It promises ease, sunlit afternoons, reinvention. We believe it every year...", thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop", comments: 28, likes: 4.6 },
    { id: 3, authorName: "Sophia Martinez", authorAvatar: "https://i.pravatar.cc/150?img=9", verified: false, date: "Dec 2, 2025", title: "Design Thinking: From Concept to Reality", description: "A deep dive into the design thinking process and how it can help teams solve complex problems...", thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=300&fit=crop", comments: 35, likes: 4.9 },
    { id: 4, authorName: "Michael Chen", authorAvatar: "https://i.pravatar.cc/150?img=11", verified: true, date: "Dec 1, 2025", title: "The Complete Guide to Building Scalable APIs", description: "Learn the best practices for designing and implementing RESTful APIs that can handle millions of requests...", thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop", comments: 67, likes: 4.7 }
  ],
  trending: [
    { title: "The Future of Remote Work: What 2025 Holds", author: "Sarah Chen" },
    { title: "Building Better Products with AI", author: "Marcus Rivera" },
    { title: "Design Systems That Actually Work", author: "Emma Thompson" }
  ],
  topics: ["Technology", "AI", "Lifestyle", "Startup", "Design", "Programming"],
  usersToFollow: [
    { name: "David Miller", bio: "Tech writer", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Sophia Anderson", bio: "UX designer", avatar: "https://i.pravatar.cc/150?img=25" }
  ]
};

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Layout Grid */}
      <main className="pt-16 flex h-screen overflow-hidden">
        
        {/* Left Column (Feed) */}
        <section className={`flex-1 overflow-y-auto px-6 py-8 border-r transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-0"}`}>
          <div className="max-w-[700px] mx-auto">
            {DATA.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Right Column (Widgets) - Visible only on large screens */}
        <aside className="hidden lg:block w-[320px] p-8 overflow-y-auto space-y-10">
          
          {/* Trending Section */}
          <div>
            <h3 className="font-bold mb-4 font-serif">Trending</h3>
            {DATA.trending.map((item, i) => (
              <div key={i} className="flex gap-3 mb-4 group cursor-pointer">
                <span className="text-xl font-bold text-gray-200 group-hover:text-teal-500">{i + 1}</span>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-teal-500">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.author}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Topics Section */}
          <div>
            <h3 className="font-bold mb-4 font-serif">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {DATA.topics.map((topic) => (
                <button key={topic} className="px-3 py-1 bg-gray-50 border rounded-full text-xs hover:bg-teal-500 hover:text-white transition">
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Follow Section */}
          <div>
            <h3 className="font-bold mb-4 font-serif">Who to follow</h3>
            {DATA.usersToFollow.map((user, i) => (
              <div key={i} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src={user.avatar} className="w-8 h-8 rounded-full" />
                  <div className="truncate"><p className="text-sm font-bold truncate">{user.name}</p></div>
                </div>
                <button className="text-xs border border-teal-500 text-teal-500 px-3 py-1 rounded-full hover:bg-teal-500 hover:text-white">Follow</button>
              </div>
            ))}
          </div>

        </aside>
      </main>
    </div>
  );
}