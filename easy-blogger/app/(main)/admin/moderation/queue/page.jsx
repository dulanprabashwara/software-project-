"use client";
import { useState } from "react";
import { Search, Filter, CheckCircle, Trash2, Ban, Clock, User, Tag } from "lucide-react";

export default function QueuePage() {
  //mock data
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "How AI is Transforming Content Creation",
      reason: "Spam", // Trigger for Spam
      reporter: "System_Bot_99",
      timeReported: "7:30 PM",
      timeAgo: "2h ago",
      status: "pending", 
      tags: ["AI", "Crypto", "Money"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
      // SPAM CONTENT
      content: "Artificial Intelligence is changing the game. But why work hard when you can let the bot do it? I made $50,000 last month using this one simple trick. You don't need skills, you don't need a degree. CLICK HERE TO CLAIM YOUR FREE BITCOIN: http://scam-link-crypto.com/register. Don't be a loser working a 9-5 job."
    },
    {
      id: 2,
      title: "Best Books to Read on your Summer Holiday",
      reason: "Harassment", // Trigger for Harassment
      reporter: "Karen_Reader",
      timeReported: "6:15 PM",
      timeAgo: "5h ago",
      status: "pending",
      tags: ["Books", "Summer", "Opinion"],
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
      // HARASSMENT CONTENT
      content: "Summer is here. But let's be honest. If you are one of those pathetic people who reads romance novels on the beach, please do us all a favor and stay home. Nobody wants to see you rotting your brain with that trash. Romance readers are genuinely the most brain-dead group of people in the literary world."
    },
    {
      id: 3,
      title: "Design Thinking: From Concept to Reality",
      reason: "Spam", // False positive (Safe content marked as spam)
      reporter: "Competitor_X",
      timeReported: "5:00 PM",
      timeAgo: "1d ago",
      status: "reviewed", // Green pill
      tags: ["Design", "UX", "Product"],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=300&h=200",
      // SAFE CONTENT
      content: "A deep dive into the design thinking process and how it can help teams solve complex problems, innovate faster, and create products that truly resonate with users. We explore Empathy, Definition, Ideation, and Prototyping as the core pillars of modern UX."
    }
  ]);

  // State to track which post is currently open on the right side
  const [selectedId, setSelectedId] = useState(1);
  const selectedPost = posts.find((p) => p.id === selectedId);

  // actions
  const handleAction = (action) => {
    if (!selectedPost) return;
    if (confirm(`Are you sure you want to ${action} this post?`)) {
      // Remove from list for demo purposes
      setPosts(posts.filter((p) => p.id !== selectedId));
      // Select the next available post
      if (posts.length > 1) setSelectedId(posts[0].id === selectedId ? posts[1].id : posts[0].id);
      else setSelectedId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      
      {/* --- LEFT COLUMN: LIST --- */}
      <div className="w-1/3 flex flex-col gap-4">
        
        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="input input-bordered w-full pl-10 h-10 bg-white border-[#E5E7EB] text-sm"
            />
          </div>
          <button className="btn btn-square btn-outline border-[#E5E7EB] h-10 min-h-0 w-10">
            <Filter className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* The List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {posts.map((post) => (
            <div 
              key={post.id}
              onClick={() => setSelectedId(post.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedId === post.id 
                  ? "border-[#1ABC9C] bg-white shadow-md" 
                  : "bg-white hover:bg-gray-50 border-[#E5E7EB]"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-[#111827]">{post.reason}</span>
                {post.status === "pending" ? (
                  <div className="w-8 h-3 rounded-full bg-yellow-400" title="Pending"></div>
                ) : (
                  <div className="w-8 h-3 rounded-full bg-[#1ABC9C]" title="Reviewed"></div>
                )}
              </div>
              <h3 className="font-bold text-[#111827] leading-tight mb-2 line-clamp-2">
                {post.title}
              </h3>
              <span className="text-xs text-[#6B7280]">{post.timeAgo}</span>
            </div>
          ))}

          {/* Legend at bottom of list */}
          <div className="flex gap-4 mt-2 px-2 text-xs text-[#111827] font-medium">
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded-full bg-[#1ABC9C]"></div> Reviewed
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded-full bg-yellow-400"></div> Pending
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: DETAIL VIEW --- */}
      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col overflow-hidden">
        {selectedPost ? (
          <>
            {/* Header Info */}
            <div className="p-6 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <div className="grid grid-cols-1 text-sm text-[#111827] gap-1">
                <p><span className="font-semibold">Reported by:</span> {selectedPost.reporter}</p>
                <p><span className="font-semibold">Reason:</span> {selectedPost.reason}</p>
                <p><span className="font-semibold">Time of reported:</span> {selectedPost.timeReported}</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 flex-1 overflow-y-auto">
              <h1 className="text-2xl font-bold text-[#111827] mb-6" style={{ fontFamily: "Georgia, serif" }}>
                {selectedPost.title}
              </h1>
              
              <p className="text-[#6B7280] leading-relaxed mb-6">
                {selectedPost.content}
              </p>

              {selectedPost.image && (
                <div className="mb-6">
                  <img src={selectedPost.image} alt="Post content" className="rounded-lg max-w-sm shadow-sm" />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-200 text-[#111827] text-xs font-medium rounded-full flex items-center gap-1">
                    {tag} <span className="cursor-pointer hover:text-red-500">×</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-4">
              <button 
                onClick={() => handleAction("Keep")}
                className="btn bg-[#1a4d44] hover:bg-[#143d36] text-white border-none gap-2 px-6 rounded-full"
              >
                Keep <CheckCircle size={18} />
              </button>
              
              <button 
                onClick={() => handleAction("Delete")}
                className="btn bg-[#3e5c58] hover:bg-[#2f4643] text-white border-none gap-2 px-6 rounded-full"
              >
                Delete <Trash2 size={18} />
              </button>
              
              <button 
                onClick={() => handleAction("Ban User")}
                className="btn bg-[#183632] hover:bg-black text-white border-none gap-2 px-6 rounded-full"
              >
                Ban <Ban size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#6B7280]">
            Select a post to view details
          </div>
        )}
      </div>

    </div>
  );
}