"use client";
import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks the fetching state
  const [searchQuery, setSearchQuery] = useState("");
  const [banningUser, setBanningUser] = useState(null);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    // Proving architecture by fetching from your Mock API
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false); // Stop loading once data arrives
      });
  }, []);

  const handleToggleClick = (user) => {
    if (user.status === "Active") setBanningUser(user);
    else updateUserStatus(user.id, "Active", "Re-activated by admin");
  };

  const updateUserStatus = async (id, newStatus, reason) => {
    const auditData = {
      userId: id,
      action: newStatus === "Banned" ? "BAN_USER" : "ACTIVATE_USER",
      reason: reason || banReason,
      timestamp: new Date().toISOString(),
      performedBy: "Admin_Jane" 
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      });

      if (response.ok) {
        console.log("✅ PostgreSQL Audit Log Prepared:", auditData);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        setBanningUser(null);
        setBanReason("");
      }
    } catch (error) {
      console.error("Failed to track audit log:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-[#111827] ml-4" style={{ fontFamily: "serif" }}>User List</h1>
      
      <div className="max-w-[1050px] bg-[#D1D5DB]/50 rounded-[45px] overflow-hidden shadow-sm">
        <div className="bg-[#D1D5DB] p-5 px-10 border-b-[3px] border-[#1ABC9C] flex items-center justify-between">
          <div className="flex items-center gap-5 text-[11px] font-bold text-gray-600 uppercase">
             <div className="flex items-center gap-2"><Filter size={16} /> Filter by</div>
             {['regular', 'premium', 'banned', 'active'].map(f => (
               <label key={f} className="flex items-center gap-2 opacity-70 cursor-pointer"><input type="checkbox" className="checkbox checkbox-xs" /> {f}</label>
             ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Username" 
              value={searchQuery || ""} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 py-1.5 rounded-full bg-white/80 border-none outline-none text-[10px]" 
            />
          </div>
        </div>

        <div className="pb-8 pt-2">
          <table className="w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-gray-500 text-[12px]">
                <th className="p-3 pl-16 text-left font-semibold">User Info</th>
                <th className="p-3 text-center font-semibold">Type</th>
                <th className="p-3 text-center font-semibold">ActiveStatus</th>
              </tr>
            </thead>
            <tbody>
              {/* FIXED: The Loading Spinner Logic is back! */}
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center p-20">
                    <span className="loading loading-spinner loading-lg text-[#1ABC9C]"></span>
                    <p className="text-xs text-gray-400 mt-2 font-bold italic uppercase tracking-widest">Fetching User Records...</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/20 transition-colors">
                    <td className="p-2 pl-16">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold shadow-inner">👤</div>
                        <div>
                          <div className="font-bold text-gray-800 text-[14px]">{user.name}[{user.id}]</div>
                          <div className="text-[10px] text-gray-400 italic font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center font-black text-gray-800 text-[15px] uppercase">{user.type}</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={user.status === "Active"} onChange={() => handleToggleClick(user)} />
                          <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#1ABC9C] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BAN MODAL --- */}
      {banningUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full border border-gray-100 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2 text-center">Ban User?</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium text-center px-4">
              Are you sure you want to ban <strong>{banningUser.name}</strong>? This action will be recorded.
            </p>
            <textarea 
               className="w-full p-4 border border-gray-200 rounded-3xl text-sm h-32 mb-6 focus:ring-2 focus:ring-red-100 outline-none resize-none bg-gray-50"
               placeholder="Reason for banning..."
               value={banReason || ""}
               onChange={(e) => setBanReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setBanningUser(null)} className="flex-1 btn btn-ghost rounded-2xl h-12 font-bold">Cancel</button>
              <button 
                onClick={() => updateUserStatus(banningUser.id, "Banned")} 
                className="flex-1 btn bg-red-500 hover:bg-red-600 text-white border-none rounded-2xl h-12 font-bold"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}