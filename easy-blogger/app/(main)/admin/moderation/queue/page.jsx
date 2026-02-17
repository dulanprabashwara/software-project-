"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle, Trash2, Ban, ChevronDown, MousePointer2 } from "lucide-react";

export default function QueuePage() {
  // --- STATE ---
  const [filterStatus, setFilterStatus] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  
  // CHANGED: Set this to NULL so nothing is selected at start
  const [selectedId, setSelectedId] = useState(null); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref for clicking outside to close dropdown
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- MOCK DATA ---
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "How AI is Transforming Content Creation",
      reason: "Spam",
      reporter: "System_Bot_99",
      timeReported: "7:30 PM",
      timeAgo: "2h ago",
      status: "pending", 
      tags: ["AI", "Crypto", "Money"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
      content: "Artificial Intelligence is changing the game. But why work hard when you can let the bot do it? I made $50,000 last month using this one simple trick. You don't need skills, you don't need a degree. CLICK HERE TO CLAIM YOUR FREE BITCOIN: http://scam-link-crypto.com/register. Don't be a loser working a 9-5 job."
    },
    {
      id: 2,
      title: "Best Books to Read on your Summer Holiday",
      reason: "Harassment",
      reporter: "Karen_Reader",
      timeReported: "6:15 PM",
      timeAgo: "5h ago",
      status: "pending",
      tags: ["Books", "Summer", "Opinion"],
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
      content: "Summer is here. But let's be honest. If you are one of those pathetic people who reads romance novels on the beach, please do us all a favor and stay home. Nobody wants to see you rotting your brain with that trash. Romance readers are genuinely the most brain-dead group of people in the literary world."
    },
    {
      id: 3,
      title: "Design Thinking: From Concept to Reality",
      reason: "False Report",
      reporter: "Competitor_X",
      timeReported: "5:00 PM",
      timeAgo: "1d ago",
      status: "reviewed",
      tags: ["Design", "UX", "Product"],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=300&h=200",
      content: "A deep dive into the design thinking process and how it can help teams solve complex problems, innovate faster, and create products that truly resonate with users. We explore Empathy, Definition, Ideation, and Prototyping as the core pillars of modern UX."
    }
  ]);

  // --- FILTER LOGIC ---
  const filteredPosts = posts.filter(post => {
    const statusMatch = filterStatus ? post.status === filterStatus : true;
    const searchMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });
  
  const selectedPost = posts.find((p) => p.id === selectedId);

  // --- ACTIONS ---
  const handleAction = (action) => {
    if (!selectedPost) return;
    if (confirm(`Are you sure you want to ${action} this post?`)) {
      setPosts(posts.filter((p) => p.id !== selectedId));
      setSelectedId(null); // Go back to empty state after action
    }
  };

  const getDropdownColor = () => {
    if (filterStatus === 'pending') return 'bg-[#EAB308] hover:bg-[#CA8A04] text-white';
    if (filterStatus === 'reviewed') return 'bg-[#1ABC9C] hover:bg-[#16a085] text-white';
    return 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1ABC9C]';
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 bg-[#F9FAFB]">
      
      {/* --- LEFT COLUMN: CONTROLS & LIST --- */}
      <div className="w-1/3 flex flex-col gap-4">
        
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>
          Moderation
        </h1>

        {/* 1. ROW: DROPDOWN & SEARCH */}
        <div className="flex gap-2 relative z-20"> 
          
          {/* Custom Dropdown */}
          <div className="relative w-36" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full h-10 px-4 rounded-lg font-medium flex items-center justify-between transition-all ${getDropdownColor()}`}
            >
              <span className="capitalize">{filterStatus || "Status"}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { setFilterStatus('pending'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-[#EAB308] hover:bg-[#FEF9C3] transition-colors"
                >
                  Pending
                </button>
                <button 
                  onClick={() => { setFilterStatus('reviewed'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-[#1ABC9C] hover:bg-[#CCFBF1] transition-colors"
                >
                  Reviewed
                </button>
                 <button 
                  onClick={() => { setFilterStatus(null); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 border-t border-gray-100"
                >
                  Show All
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#1ABC9C] focus:ring-1 focus:ring-[#1ABC9C]"
            />
          </div>
        </div>

        {/* 2. ROW: MODE SWITCHER */}
        <div className="bg-[#E5E7EB] p-1 rounded-full flex text-sm font-medium z-10">
          <Link 
            href="/admin/moderation/queue" 
            className="flex-1 py-1.5 text-center bg-white text-[#111827] shadow-sm rounded-full transition-all"
          >
            Queue
          </Link>
          <Link 
            href="/admin/moderation/offers" 
            className="flex-1 py-1.5 text-center text-[#6B7280] hover:text-[#111827] transition-all"
          >
            Offers
          </Link>
        </div>

        {/* 3. THE LIST */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 mt-2 z-0">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm italic">
              No posts found.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => setSelectedId(post.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedId === post.id 
                    ? "border-[#1ABC9C] bg-white shadow-md ring-1 ring-[#1ABC9C]" 
                    : "border-[#E5E7EB] bg-white hover:border-[#1ABC9C] hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-[#111827] text-sm">{post.reason}</span>
                  <div 
                    className={`w-2 h-2 rounded-full ${post.status === 'pending' ? 'bg-[#EAB308]' : 'bg-[#1ABC9C]'}`} 
                    title={post.status}
                  ></div>
                </div>
                <h3 className="font-bold text-[#111827] text-sm leading-tight mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <span className="text-xs text-[#6B7280]">{post.timeAgo}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: DETAIL VIEW (Starts Empty) --- */}
      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col overflow-hidden relative">
        {selectedPost ? (
          <>
            <div className="p-6 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-[#111827]"><span className="font-semibold text-[#6B7280]">Reported by:</span> {selectedPost.reporter}</p>
                  <p className="text-sm text-[#111827]"><span className="font-semibold text-[#6B7280]">Reason:</span> {selectedPost.reason}</p>
                  <p className="text-sm text-[#111827]"><span className="font-semibold text-[#6B7280]">Posted:</span> {selectedPost.timeReported}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  selectedPost.status === 'pending' ? 'bg-[#FEF9C3] text-[#854D0E]' : 'bg-[#CCFBF1] text-[#0F766E]'
                }`}>
                  {selectedPost.status}
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <h1 className="text-2xl font-bold text-[#111827] mb-6" style={{ fontFamily: "Georgia, serif" }}>
                {selectedPost.title}
              </h1>
              
              {selectedPost.image && (
                <div className="mb-6">
                  <img src={selectedPost.image} alt="Post content" className="rounded-lg shadow-sm w-full max-h-80 object-cover" />
                </div>
              )}

              <p className="text-[#374151] leading-relaxed whitespace-pre-line text-base">
                {selectedPost.content}
              </p>

              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-[#4B5563] text-xs font-medium rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-4">
              <button 
                onClick={() => handleAction("Keep")}
                className="group flex items-center gap-3 bg-[#114A3F] hover:bg-[#0D3B32] text-white pl-6 pr-2 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span className="font-bold text-sm">Keep</span>
                <div className="w-8 h-8 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#114A3F]">
                  <CheckCircle size={18} strokeWidth={2.5} />
                </div>
              </button>
              
              <button 
                onClick={() => handleAction("Delete")}
                className="group flex items-center gap-3 bg-[#134E4A] hover:bg-[#0F3F3C] text-white pl-6 pr-2 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span className="font-bold text-sm">Delete</span>
                <div className="w-8 h-8 bg-[#99F6E4] rounded-full flex items-center justify-center text-[#134E4A]">
                  <Trash2 size={18} strokeWidth={2.5} />
                </div>
              </button>
              
              <button 
                onClick={() => handleAction("Ban User")}
                className="group flex items-center gap-3 bg-[#1F2937] hover:bg-black text-white pl-6 pr-2 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span className="font-bold text-sm">Ban</span>
                <div className="w-8 h-8 bg-[#F87171] rounded-full flex items-center justify-center text-[#1F2937]">
                  <Ban size={18} strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </>
        ) : (
          /* --- THIS IS THE EMPTY STATE --- */
          <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF] select-none">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <MousePointer2 size={32} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No Post Selected</h3>
            <p className="text-sm">Click on a post from the queue to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}