"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle, Trash2, Ban, ChevronDown, MousePointer2 } from "lucide-react";

export default function QueuePage() {
  const [posts, setPosts] = useState([]); // Now starts as empty and fills from Server
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- FETCH ALL POST DATA FROM SERVER ---
  useEffect(() => {
    // This fetches the full array from route.js, including images
    fetch('/api/users?type=posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const handleAction = async (actionType) => {
    const selectedPost = posts.find(p => p.id === selectedId);
    if (!selectedPost || !confirm(`Are you sure you want to ${actionType} this post?`)) return;

    // Constructing the Audit Log entry for the server
    const auditEntry = {
      admin: "Admin Dulsi",
      action: actionType === "Keep" ? "Reviewed Report" : actionType === "Delete" ? "Deleted Article" : "Banned User",
      target: actionType === "Delete" ? `article_${selectedPost.id}` : `user_${selectedPost.reporter.toLowerCase()}`,
      details: selectedPost.reason,
      endpoint: actionType === "Delete" ? "DELETE /api/articles/{id}" : "POST /api/users/{id}/ban"
    };

    try {
      // Tells route.js to delete this post from its 'posts' array
      await fetch('/api/users?action=deletePost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...auditEntry, postId: selectedPost.id }),
      });

      // Update local UI state to match server
      setPosts(posts.filter(p => p.id !== selectedId));
      setSelectedId(null);
    } catch (error) { 
      console.error("Failed to process action:", error); 
    }
  };

  // --- UI LOGIC ---
  const filteredPosts = posts.filter(post => {
    const statusMatch = filterStatus ? post.status === filterStatus : true;
    const searchMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activePost = posts.find(p => p.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 bg-[#F9FAFB]">
      {/* LEFT COLUMN: LIST */}
      <div className="w-1/3 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Moderation</h1>
        <div className="flex gap-2 relative z-20"> 
          <div className="relative w-36" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full h-10 px-4 rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] font-medium flex items-center justify-between transition-all">
              <span className="capitalize">{filterStatus || "Status"}</span>
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="relative flex-1 text-[#9CA3AF]">
            <Search className="absolute left-3 top-3 w-4 h-4" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-10 bg-white border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#1ABC9C]" />
          </div>
        </div>
        
        <div className="bg-[#E5E7EB] p-1 rounded-full flex text-sm font-medium z-10">
          <Link href="/admin/moderation/queue" className="flex-1 py-1.5 text-center bg-white text-[#111827] shadow-sm rounded-full">Queue</Link>
          <Link href="/admin/moderation/offers" className="flex-1 py-1.5 text-center text-[#6B7280]">Offers</Link>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mt-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="text-center p-10 italic text-gray-400">Syncing with Server...</div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} onClick={() => setSelectedId(post.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedId === post.id ? "border-[#1ABC9C] bg-white shadow-md ring-1 ring-[#1ABC9C]" : "bg-white border-[#E5E7EB] hover:border-[#1ABC9C]"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-[#111827] text-sm">{post.reason}</span>
                  <div className={`w-2 h-2 rounded-full ${post.status === 'pending' ? 'bg-[#EAB308]' : 'bg-[#1ABC9C]'}`}></div>
                </div>
                <h3 className="font-bold text-[#111827] text-sm leading-tight line-clamp-2">{post.title}</h3>
                <span className="text-xs text-[#6B7280]">{post.timeAgo}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: DETAIL VIEW */}
      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col overflow-hidden relative">
        {activePost ? (
          <>
            <div className="p-6 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-sm text-[#111827]">
                  <p><span className="font-semibold text-[#6B7280]">Reported by:</span> {activePost.reporter}</p>
                  <p><span className="font-semibold text-[#6B7280]">Reason:</span> {activePost.reason}</p>
                  <p><span className="font-semibold text-[#6B7280]">Posted:</span> {activePost.timeReported}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${activePost.status === 'pending' ? 'bg-[#FEF9C3] text-[#854D0E]' : 'bg-[#CCFBF1] text-[#0F766E]'}`}>{activePost.status}</span>
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <h1 className="text-2xl font-bold text-[#111827] mb-6 font-serif">{activePost.title}</h1>
              
              {/* Image rendered from route.js data */}
              {activePost.image && (
                <div className="mb-6">
                  <img src={activePost.image} alt="Post content" className="rounded-lg shadow-sm w-full max-h-80 object-cover" />
                </div>
              )}

              <p className="text-[#374151] leading-relaxed text-base whitespace-pre-line">{activePost.content}</p>
              
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                {activePost.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-[#4B5563] text-xs font-medium rounded-full">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-4">
              <button onClick={() => handleAction("Keep")} className="group flex items-center gap-3 bg-[#114A3F] text-white pl-6 pr-2 py-2 rounded-full active:scale-95 transition-all shadow-md">
                <span className="font-bold text-sm">Keep</span>
                <div className="w-8 h-8 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#114A3F]"><CheckCircle size={18} /></div>
              </button>
              <button onClick={() => handleAction("Delete")} className="group flex items-center gap-3 bg-[#134E4A] text-white pl-6 pr-2 py-2 rounded-full active:scale-95 transition-all shadow-md">
                <span className="font-bold text-sm">Delete</span>
                <div className="w-8 h-8 bg-[#99F6E4] rounded-full flex items-center justify-center text-[#134E4A]"><Trash2 size={18} /></div>
              </button>
              <button onClick={() => handleAction("Ban User")} className="group flex items-center gap-3 bg-[#1F2937] text-white pl-6 pr-2 py-2 rounded-full active:scale-95 transition-all shadow-md">
                <span className="font-bold text-sm">Ban</span>
                <div className="w-8 h-8 bg-[#F87171] rounded-full flex items-center justify-center text-[#1F2937]"><Ban size={18} /></div>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF]">
            <MousePointer2 size={32} className="mb-4" />
            <h3 className="text-lg font-semibold">No Post Selected</h3>
            <p className="text-sm">Click on a post from the queue to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}