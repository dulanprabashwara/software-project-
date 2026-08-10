"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, Search, MousePointer2 } from "lucide-react";
import { auth } from "../../../../lib/firebase";
import { api } from "../../../../lib/api";
import Pagination from "../../../../components/admin/Pagination";

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  // UI State
  const [filterStatus, setFilterStatus] = useState(null); // null = ALL
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);
  

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      let query = `?page=${page}&limit=${limit}`;
      if (filterStatus && filterStatus !== "ALL") {
        query += `&status=${encodeURIComponent(filterStatus)}`;
      }

      const res = await api.getSupportRequests(query, token);
      const ticketsData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      setTickets(ticketsData);
      setMeta(res.meta);
      
      // If re-fetch and the selected ticket is no longer in the list (e.g. filtered out), deselect it
      if (selectedId && !ticketsData.find(t => t.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, selectedId]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
        setLoading(false);
      }
    });
    // Close dropdown on outside click
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Trigger Fetch when Auth or Pagination changes
  useEffect(() => {
    if (isAuth) {
      fetchTickets();
    }
  }, [fetchTickets, isAuth]);

  // Handle clicking a ticket (Marks as read automatically)
  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    
    if (!ticket.isRead) {
      try {
        const token = await auth.currentUser.getIdToken();
        await api.updateSupportRequest(ticket.id, { isRead: true }, token);
        
        // Update local state so it instantly shows as read without a full refetch
        setTickets(tickets.map(t => t.id === ticket.id ? { ...t, isRead: true } : t));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  // Handle marking as resolved
  const handleResolve = async () => {
    const activePost = tickets.find(t => t.id === selectedId);
    if (!activePost || !confirm(`Mark ticket from ${activePost.email} as resolved?`)) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      await api.updateSupportRequest(activePost.id, { status: "RESOLVED" }, token);
      
      setTickets(tickets.map(t => t.id === activePost.id ? { ...t, status: "RESOLVED" } : t));
    } catch (error) {
      console.error("Failed to resolve ticket:", error);
      alert("Action failed. Check console.");
    }
  };

  // UI Helpers
  const getDropdownColor = () => {
    if (filterStatus === 'PENDING') return 'bg-[#EAB308] text-white';
    if (filterStatus === 'RESOLVED') return 'bg-[#1ABC9C] text-white';
    return 'bg-white border border-[#E5E7EB] text-[#6B7280]';
  };

  // Local Search Filtering
  const filteredTickets = tickets.filter(ticket => {
    const searchMatch = ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        ticket.problem.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  const activePost = tickets.find(p => p.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 bg-[#F9FAFB]">
      
      {/* LEFT COLUMN */}
      <div className="w-1/3 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Support Inbox</h1>
        
        {/* Filters & Search */}
        <div className="flex gap-2 relative z-20">
          <div className="relative w-36" ref={dropdownRef}>
            <button suppressHydrationWarning onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full h-10 px-4 rounded-lg font-medium flex items-center justify-between transition-all ${getDropdownColor()}`}>
              <span className="capitalize">{filterStatus || "Status"}</span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden">
                <button onClick={() => { setFilterStatus('PENDING'); setIsDropdownOpen(false); setPage(1); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-[#EAB308] hover:bg-[#FEF9C3]">PENDING</button>
                <button onClick={() => { setFilterStatus('RESOLVED'); setIsDropdownOpen(false); setPage(1); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-[#1ABC9C] hover:bg-[#CCFBF1]">RESOLVED</button>
                <button onClick={() => { setFilterStatus(null); setIsDropdownOpen(false); setPage(1); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 border-t">Show All</button>
              </div>
            )}
          </div>
          <div className="relative flex-1 text-[#9CA3AF]">
            <Search className="absolute left-3 top-3 w-4 h-4" />
            <input suppressHydrationWarning type="text" placeholder="Search by email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-10 bg-white border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#1ABC9C]" />
          </div>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="text-center p-10 italic text-gray-400">Loading inbox...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center p-10 font-medium text-gray-400">No tickets found.</div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} onClick={() => handleSelectTicket(ticket)} className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedId === ticket.id ? "border-[#1ABC9C] bg-white shadow-md ring-1 ring-[#1ABC9C]" : "bg-white border-[#E5E7EB] hover:border-[#1ABC9C]"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm truncate pr-2 ${!ticket.isRead ? "font-bold text-[#111827]" : "font-semibold text-gray-600"}`}>
                    {ticket.email}
                  </span>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${ticket.status === 'PENDING' ? 'bg-[#EAB308]' : 'bg-[#1ABC9C]'}`}></div>
                </div>
                <h3 className={`text-sm leading-tight line-clamp-2 ${!ticket.isRead ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                  {ticket.problem}
                </h3>
              </div>
            ))
          )}
        </div>

        {/* Pagination locked to the bottom of the left column */}
        {meta && !loading && tickets.length > 0 && (
          <div className="pt-4 border-t border-gray-200 bg-[#F9FAFB]">
            <Pagination 
              currentPage={page}
              totalPages={meta.totalPages}
              totalItems={meta.totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
            />
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col overflow-hidden relative">
        {activePost ? (
          <>
            {/* Header Details */}
            <div className="p-6 px-8 border-b border-gray-100 text-sm">
              <div className="space-y-0.5">
                <p className="text-[#111827]"><span className="font-semibold">User Email:</span> <a href={`mailto:${activePost.email}`} className="text-[#1ABC9C] hover:underline">{activePost.email}</a></p>
                <p className="text-[#111827]"><span className="font-semibold">Ticket ID:</span> {activePost.id}</p>
                <p className="text-[#111827]"><span className="font-semibold">Time Submitted:</span> {new Date(activePost.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 flex-1 overflow-y-auto pt-4">
              <h1 className="text-2xl font-bold text-[#111827] mb-6 font-serif">Problem Description</h1>
              <p className="text-[#374151] leading-relaxed text-base whitespace-pre-wrap bg-gray-50 p-6 rounded-xl border border-gray-100">
                {activePost.problem}
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-4">
              {activePost.status === 'RESOLVED' ? (
                <div className="flex items-center gap-3 bg-[#CCFBF1] text-[#0F766E] px-6 py-2 rounded-full border border-[#1ABC9C] shadow-sm">
                  <CheckCircle size={18} /><span className="font-bold text-sm">Ticket Resolved</span>
                </div>
              ) : (
                <button onClick={handleResolve} className="group flex items-center gap-3 bg-[#114A3F] text-white pl-6 pr-2 py-2 rounded-full active:scale-95 transition-all shadow-md cursor-pointer">
                  <span className="font-bold text-sm">Mark Resolved</span>
                  <div className="w-8 h-8 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#114A3F]"><CheckCircle size={18} /></div>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF]">
            <MousePointer2 size={32} className="mb-4" />
            <h3 className="text-lg font-semibold">Select a ticket to view details</h3>
          </div>
        )}
      </div>
    </div>
  );
}