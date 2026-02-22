"use client";
import { useEffect, useState } from "react";
import { Search, Filter, X, AlertCircle, Download } from "lucide-react";

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

  // --- CSV EXPORT LOGIC ---
  const exportToCSV = (filename, userList) => {
    if (userList.length === 0) return alert("No data to export");
    const headers = ["ID", "Name", "Email", "Type", "Status", "Start Date", "End Date", "Payment Method"];
    const rows = userList.map(u => [
      u.id, u.name, u.email, u.type, u.status, u.startDate, u.endDate, u.paymentMethod
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

    const userObj = users.find(u => u.id === id);
    const auditEntry = {
      userId: id,
      admin: "Admin Dulsi",
      action: newStatus === "Banned" ? "Banned User" : "Unbanned User",
      target: `user_${userObj?.name.toLowerCase().replace(/\s+/g, '_') || id}`,
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
        if (selectedUser?.id === id) setSelectedUser({...selectedUser, status: newStatus});
      }
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter(user => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = (user.name?.toLowerCase() || "").includes(cleanQuery) || (user.email?.toLowerCase() || "").includes(cleanQuery);
    
    const typeFiltersActive = activeFilters.regular || activeFilters.premium;
    const statusFiltersActive = activeFilters.banned || activeFilters.active;

    const matchesType = !typeFiltersActive || 
      (activeFilters.regular && user.type === "Regular") || 
      (activeFilters.premium && user.type === "Premium");

    const matchesStatus = !statusFiltersActive || 
      (activeFilters.banned && user.status === "Banned") || 
      (activeFilters.active && user.status === "Active");

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-8 bg-white min-h-screen relative overflow-hidden">
      <h1 className="text-4xl font-bold mb-8 text-[#111827] ml-4" style={{ fontFamily: "serif" }}>User List</h1>
      
      <div className={`max-w-262.5 bg-[#D1D5DB]/50 rounded-[45px] overflow-hidden shadow-sm transition-all duration-500 pb-4 ${selectedUser ? "blur-md opacity-40 pointer-events-none" : ""}`}>
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
            <input type="text" placeholder="Username or email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 py-1.5 rounded-full bg-white/80 border-none outline-none text-[10px]" />
          </div>
        </div>

        <div className="pt-2">
          <table className="w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-gray-500 text-[12px]">
                <th className="p-3 pl-16 text-left font-semibold">User Info</th>
                <th className="p-3 text-center font-semibold">Type</th>
                <th className="p-3 text-center font-semibold">ActiveStatus</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center p-20"><span className="loading loading-spinner loading-lg text-[#1ABC9C]"></span></td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/20 transition-colors">
                    <td className="p-2 pl-16 cursor-pointer" onClick={() => setSelectedUser(user)}>
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
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={user.status === "Active"} onChange={() => handleToggleClick(user)} />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#1ABC9C] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 px-10 mt-6 mb-4">
          <button onClick={() => exportToCSV("revenue_report.csv", filteredUsers.filter(u => u.type === "Premium"))} className="flex items-center gap-2 bg-white text-gray-500 font-bold text-[10px] px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all uppercase"><Download size={14} /> Download Revenue Report</button>
          <button onClick={() => exportToCSV("banned_users.csv", filteredUsers.filter(u => u.status === "Banned"))} className="flex items-center gap-2 bg-white text-gray-500 font-bold text-[10px] px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all uppercase"><Download size={14} /> Export Banned Users</button>
          <button onClick={() => exportToCSV("active_users.csv", filteredUsers.filter(u => u.status === "Active"))} className="flex items-center gap-2 bg-white text-gray-500 font-bold text-[10px] px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all uppercase"><Download size={14} /> Export Active Users</button>
        </div>
      </div>

      {/* DYNAMIC SIDE PANEL */}
      <aside className={`fixed top-20 right-10 bottom-10 w-84 bg-[#D1D5DB] border border-gray-300 rounded-[40px] shadow-2xl transition-transform duration-500 z-50 ${selectedUser ? "translate-x-0" : "translate-x-[120%]"}`}>
        {selectedUser && (
          <div className="p-6 relative flex flex-col items-center h-full">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-red-500 hover:bg-white/40 p-1 rounded-full"><X size={20}/></button>
            <h3 className="text-sm font-bold mb-6 text-gray-700 tracking-tight uppercase">Subscription Details</h3>
            
            <div className="bg-white p-8 rounded-[35px] w-full shadow-inner border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-gray-900 leading-none" style={{ fontFamily: "serif" }}>
                  {selectedUser.name.split(' ').map((part, i) => (
                    <span key={i} className="block">{part}</span>
                  ))}
                </h2>
                <p className="text-[11px] font-bold text-gray-400 mt-2 tracking-widest uppercase">{selectedUser.id}</p>
              </div>

              <div className="space-y-6 text-center">
                <div>
                  <div className="text-lg font-black text-[#111827] uppercase">{selectedUser.type}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">(Monthly)</div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-[10px] italic font-bold text-gray-400 uppercase">Subscription Status:</div>
                  <div className={`text-xs font-bold ${selectedUser.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{selectedUser.status}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold italic text-gray-500 uppercase"><span>Start Date:</span><span className="text-gray-400">{selectedUser.startDate}</span></div>
                  <div className="flex justify-between items-center text-[10px] font-bold italic text-gray-500 uppercase"><span>End Date:</span><span className="text-gray-400">{selectedUser.endDate}</span></div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                   <div className="text-[10px] italic font-bold text-gray-400 uppercase mb-1">Payment Method:</div>
                   <div className="text-xs font-bold text-gray-600">{selectedUser.paymentMethod}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 w-full mt-auto px-4 text-center">
               <button className="w-full bg-[#1ABC9C] hover:bg-[#16a085] text-white font-bold py-3 rounded-2xl shadow-md text-xs">Edit Plan</button>
               <button className="w-full bg-red-100 hover:bg-red-200 text-red-500 font-bold py-3 rounded-2xl text-xs">Cancel Plan</button>
            </div>
          </div>
        )}
      </aside>

      {/* BAN MODAL */}
      {banningUser && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full border border-gray-100 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2 text-center">Ban User?</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium text-center">Are you sure you want to ban <strong>{banningUser.name}</strong>?</p>
            <textarea className={`w-full p-4 border rounded-3xl text-sm h-32 mb-2 outline-none resize-none bg-gray-50 transition-colors ${validationError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-[#1ABC9C]'}`} placeholder="Reason for banning..." value={banReason} onChange={(e) => { setBanReason(e.target.value); if(e.target.value.trim().length >= 10) setValidationError(""); }} />
            {validationError && <p className="text-[10px] text-red-500 mb-4 ml-4 font-bold flex items-center gap-1"><AlertCircle size={12}/> {validationError}</p>}
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