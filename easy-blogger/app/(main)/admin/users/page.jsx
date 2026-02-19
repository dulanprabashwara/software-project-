"use client";
import { useEffect, useState } from "react";
import { Search, Filter, X, AlertCircle } from "lucide-react";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); 
  const [banningUser, setBanningUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const [activeFilters, setActiveFilters] = useState({ regular: false, premium: false, banned: false, active: false });

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (filter) => setActiveFilters(prev => ({ ...prev, [filter]: !prev[filter] }));

  const handleToggleClick = (user) => {
    if (user.status === "Active") {
      setBanningUser(user);
      setValidationError(""); 
    } else {
      updateUserStatus(user.id, "Active", "Unbanned by admin");
    }
  };

  const updateUserStatus = async (id, newStatus, reason) => {
    if (newStatus === "Banned" && (!banReason || banReason.trim().length < 10)) {
      setValidationError("Please provide a reason (min. 10 characters).");
      return; 
    }

    const auditEntry = {
      userId: id,
      admin: "Admin Dulsi",
      action: newStatus === "Banned" ? "Banned User" : "Unbanned User",
      target: `user_${users.find(u => u.id === id)?.name.toLowerCase().replace(' ', '_') || id}`,
      details: reason || banReason,
      endpoint: newStatus === "Banned" ? "POST /api/users/{id}/ban" : "POST /api/users/{id}/unban",
      newStatus: newStatus
    };

    try {
      const response = await fetch('/api/users?action=updateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditEntry),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        setBanningUser(null);
        setBanReason("");
        setValidationError("");
      }
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter(user => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = (user.name?.toLowerCase() || "").includes(cleanQuery) || (user.email?.toLowerCase() || "").includes(cleanQuery);
    const noFilters = !Object.values(activeFilters).some(Boolean);
    if (noFilters) return matchesSearch;
    const matchesType = (activeFilters.regular && user.type === "Regular") || (activeFilters.premium && user.type === "Premium");
    const matchesStatus = (activeFilters.banned && user.status === "Banned") || (activeFilters.active && user.status === "Active");
    return matchesSearch && (matchesType || matchesStatus);
  });

  return (
    <div className="p-8 bg-white min-h-screen relative overflow-hidden">
      <h1 className="text-4xl font-bold mb-8 text-[#111827] ml-4" style={{ fontFamily: "serif" }}>User List</h1>
      <div className={`max-w-[1050px] bg-[#D1D5DB]/50 rounded-[45px] overflow-hidden shadow-sm transition-all duration-500 ${selectedUser ? "blur-md opacity-40 pointer-events-none" : ""}`}>
        <div className="bg-[#D1D5DB] p-5 px-10 border-b-[3px] border-[#1ABC9C] flex items-center justify-between">
          <div className="flex items-center gap-5 text-[11px] font-bold text-gray-600 uppercase">
             <div className="flex items-center gap-2"><Filter size={16} /> Filter by</div>
             {['regular', 'premium', 'banned', 'active'].map(f => (
               <label key={f} className="flex items-center gap-2 cursor-pointer opacity-70">
                 <input type="checkbox" className="checkbox checkbox-xs" checked={activeFilters[f]} onChange={() => handleFilterChange(f)} /> {f}
               </label>
             ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            <input type="text" placeholder="Username" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 py-1.5 rounded-full bg-white/80 border-none outline-none text-[10px]" />
          </div>
        </div>
        <div className="pb-8 pt-2">
          <table className="w-full border-separate border-spacing-y-1">
            <thead><tr className="text-gray-500 text-[12px]"><th className="p-3 pl-16 text-left font-semibold">User Info</th><th className="p-3 text-center font-semibold">Type</th><th className="p-3 text-center font-semibold">ActiveStatus</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center p-20"><span className="loading loading-spinner loading-lg text-[#1ABC9C]"></span></td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/20 transition-colors">
                    <td className="p-2 pl-16 cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold shadow-inner">👤</div>
                        <div><div className="font-bold text-gray-800 text-[14px]">{user.name}[{user.id}]</div><div className="text-[10px] text-gray-400 italic font-medium">{user.email}</div></div>
                      </div>
                    </td>
                    <td className="p-2 text-center font-black text-gray-800 text-[15px] uppercase">{user.type}</td>
                    <td className="p-2 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={user.status === "Active"} onChange={() => handleToggleClick(user)} />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#1ABC9C] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside className={`fixed top-[120px] right-10 bottom-10 w-84 bg-[#D1D5DB] border border-gray-300 rounded-[40px] shadow-2xl transition-transform duration-500 z-50 ${selectedUser ? "translate-x-0" : "translate-x-[120%]"}`}>
        {selectedUser && (
          <div className="p-10 relative flex flex-col items-center h-full">
            <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-red-500 hover:bg-white/40 p-1.5 rounded-full"><X size={24}/></button>
            <h3 className="text-xl font-bold mb-8 text-gray-800">Subscription Details</h3>
            <div className="bg-white p-10 rounded-[35px] w-full text-center shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 leading-tight whitespace-pre-line">{selectedUser.name.replace(' ', '\n')}</h2>
              <p className="text-sm font-semibold text-gray-400 mt-2">{selectedUser.id}</p>
              <div className="mt-10 font-extrabold text-[#111827] text-xl uppercase">{selectedUser.type}</div>
            </div>
            <div className="space-y-4 w-full mt-auto">
               <button className="btn w-full bg-[#1ABC9C] hover:bg-[#16a085] text-white border-none rounded-2xl h-11 shadow-md">Edit Plan</button>
               <button className="btn w-full bg-red-100 hover:bg-red-200 text-red-500 border-none rounded-2xl h-11">Cancel Plan</button>
            </div>
          </div>
        )}
      </aside>

      {/* RESTORED PREVIOUS BAN MODAL UI */}
      {banningUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full border border-gray-100 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2 text-center">Ban User?</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium text-center">Are you sure you want to ban <strong>{banningUser.name}</strong>?</p>
            <textarea 
               className={`w-full p-4 border rounded-3xl text-sm h-32 mb-2 outline-none resize-none bg-gray-50 transition-colors 
                           ${validationError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-[#1ABC9C]'}`}
               placeholder="Reason for banning..."
               value={banReason}
               onChange={(e) => {
                 setBanReason(e.target.value);
                 if(e.target.value.trim().length >= 10) setValidationError(""); 
               }}
            />
            {validationError && (
              <p className="text-[10px] text-red-500 mb-4 ml-4 font-bold flex items-center gap-1">
                <AlertCircle size={12}/> {validationError}
              </p>
            )}
            <div className="flex gap-4 font-bold">
              <button onClick={() => {setBanningUser(null); setBanReason("");}} className="flex-1 btn btn-ghost rounded-2xl h-12">Cancel</button>
              <button onClick={() => updateUserStatus(banningUser.id, "Banned")} className="flex-1 btn bg-red-500 hover:bg-red-600 text-white border-none rounded-2xl h-12">Confirm Ban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}