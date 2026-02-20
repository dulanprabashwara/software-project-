"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle, Trash2, Ban, ChevronDown, MousePointer2 } from "lucide-react";

export default function QueuePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('/api/users?type=posts').then(res => res.json()).then(data => {
      setPosts(data);
      setLoading(false);
    });
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (actionType) => {
    const selectedPost = posts.find(p => p.id === selectedId);
    if (!selectedPost || !confirm(`Confirm ${actionType}?`)) return;

    const isReviewOnly = actionType === "Keep";
    const auditEntry = {
      admin: "Admin Dulsi",
      action: isReviewOnly ? "Reviewed Report" : actionType === "Delete" ? "Deleted Article" : "Banned User",
      target: isReviewOnly || actionType === "Delete" ? `article_${selectedPost.id}` : `user_${selectedPost.reporter.toLowerCase()}`,
      details: isReviewOnly ? "Content verified as safe" : selectedPost.reason,
      endpoint: isReviewOnly ? "PUT /api/reports/{id}/status" : actionType === "Delete" ? "DELETE /api/articles/{id}" : "POST /api/users/{id}/ban"
    };

    try {
      const url = isReviewOnly ? '/api/users?action=reviewPost' : '/api/users?action=deletePost';
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...auditEntry, postId: selectedPost.id }),
      });

      if (isReviewOnly) {
        setPosts(posts.map(p => p.id === selectedId ? { ...p, status: 'reviewed' } : p));
      } else {
        setPosts(posts.filter(p => p.id !== selectedId));
        setSelectedId(null);
      }
    } catch (error) { console.error(error); }
  };

  const getDropdownColor = () => {
    if (filterStatus === 'pending') return 'bg-[#EAB308] text-white';
    if (filterStatus === 'reviewed') return 'bg-[#1ABC9C] text-white';
    return 'bg-white border border-[#E5E7EB] text-[#6B7280]';
  };

  const filteredPosts = posts.filter(post => {
    const statusMatch = filterStatus ? post.status === filterStatus : true;
    const searchMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activePost = posts.find(p => p.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 bg-[#F9FAFB]">
      {/* LEFT COLUMN */}
      <div className="w-1/3 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Moderation</h1>
        <div className="flex gap-2 relative z-20"> 
          <div className="relative w-36" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full h-10 px-4 rounded-lg font-medium flex items-center justify-between transition-all ${getDropdownColor()}`}>
              <span className="capitalize">{filterStatus || "Status"}</span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden">
                <button onClick={() => { setFilterStatus('pending'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-[#EAB308] hover:bg-[#FEF9C3]">Pending</button>
                <button onClick={() => { setFilterStatus('reviewed'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-[#1ABC9C] hover:bg-[#CCFBF1]">Reviewed</button>
                <button onClick={() => { setFilterStatus(null); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 border-t">Show All</button>
              </div>
            )}
          </div>
          <div className="relative flex-1 text-[#9CA3AF]"><Search className="absolute left-3 top-3 w-4 h-4" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-10 bg-white border border-[#E5E7EB] rounded-lg text-sm" /></div>
        </div>
        <div className="bg-[#E5E7EB] p-1 rounded-full flex text-sm font-medium z-10">
          <Link href="/admin/moderation/queue" className="flex-1 py-1.5 text-center bg-white text-[#111827] shadow-sm rounded-full">Queue</Link>
          <Link href="/admin/moderation/offers" className="flex-1 py-1.5 text-center text-[#6B7280]">Offers</Link>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mt-2 pr-1 custom-scrollbar">
          {loading ? <div className="text-center p-10 italic text-gray-400">Loading...</div> : filteredPosts.map((post) => (
            <div key={post.id} onClick={() => setSelectedId(post.id)} className={`p-4 rounded-xl border transition-all ${selectedId === post.id ? "border-[#1ABC9C] bg-white shadow-md ring-1 ring-[#1ABC9C]" : "bg-white border-[#E5E7EB] hover:border-[#1ABC9C]"}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-[#111827] text-sm">{post.reason}</span>
                <div className={`w-2 h-2 rounded-full ${post.status === 'pending' ? 'bg-[#EAB308]' : 'bg-[#1ABC9C]'}`}></div>
              </div>
              <h3 className="font-bold text-[#111827] text-sm leading-tight line-clamp-2">{post.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col overflow-hidden relative">
        {activePost ? (
          <>
            <div className="p-8 flex-1 overflow-y-auto">
              <h1 className="text-2xl font-bold text-[#111827] mb-6 font-serif">{activePost.title}</h1>
              {activePost.image && <div className="mb-6"><img src={activePost.image} alt="Post content" className="rounded-lg shadow-sm w-full max-h-80 object-cover" /></div>}
              <p className="text-[#374151] leading-relaxed text-base whitespace-pre-line">{activePost.content}</p>
            </div>
            
            {/* CONDITIONAL ACTION AREA */}
            <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-4">
              {activePost.status === 'reviewed' ? (
                <div className="flex items-center gap-3 bg-[#CCFBF1] text-[#0F766E] px-6 py-2 rounded-full border border-[#1ABC9C] shadow-sm">
                  <CheckCircle size={18} /><span className="font-bold text-sm">Verified Content</span>
                </div>
              ) : (
                <button onClick={() => handleAction("Keep")} className="group flex items-center gap-3 bg-[#114A3F] text-white pl-6 pr-2 py-2 rounded-full active:scale-95 transition-all shadow-md">
                  <span className="font-bold text-sm">Keep</span>
                  <div className="w-8 h-8 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#114A3F]"><CheckCircle size={18} /></div>
                </button>
              )}
              <button onClick={() => handleAction("Delete")} className="group flex items-center gap-3 bg-[#134E4A] text-white pl-6 pr-2 py-2 rounded-full active:scale-95 transition-all shadow-md"><span className="font-bold text-sm">Delete</span><div className="w-8 h-8 bg-[#99F6E4] rounded-full flex items-center justify-center text-[#134E4A]"><Trash2 size={18} /></div></button>
              <button onClick={() => handleAction("Ban User")} className="group flex items-center gap-3 bg-[#1F2937] text-white pl-6 pr-2 py-2 rounded-full active:scale-95 transition-all shadow-md"><span className="font-bold text-sm">Ban</span><div className="w-8 h-8 bg-[#F87171] rounded-full flex items-center justify-center text-[#1F2937]"><Ban size={18} /></div></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF]"><MousePointer2 size={32} className="mb-4" /><h3 className="text-lg font-semibold">No Post Selected</h3></div>
        )}
      </div>
    </div>
  );
}