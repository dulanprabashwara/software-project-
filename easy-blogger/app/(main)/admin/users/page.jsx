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
    
    // Define headers
    const headers = ["ID", "Name", "Email", "Type", "Status", "Start Date", "End Date", "Payment Method"];
    
    // Map data to rows
    const rows = userList.map(u => [
      u.id, u.name, u.email, u.type, u.status, u.startDate, u.endDate, u.paymentMethod
    ]);

    // Construct CSV string
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // Create download link
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
      
      <div className={`max-w-[1050px] bg-[#D1D5DB]/50 rounded-[45px] overflow-hidden shadow-sm transition-all duration-500 pb-4 ${selectedUser ? "blur-md opacity-40 pointer-events-none" : ""}`}>
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

        {/* --- EXPORT BUTTONS AREA --- */}
        <div className="flex justify-end gap-3 px-10 mt-6 mb-4">
          <button 
            onClick={() => exportToCSV("revenue_report.csv", filteredUsers.filter(u => u.type === "Premium"))}
            className="flex items-center gap-2 bg-white text-gray-500 font-bold text-[10px] px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all uppercase"
          >
            <Download size={14} /> Download Revenue Report
          </button>
          <button 
            onClick={() => exportToCSV("banned_users.csv", filteredUsers.filter(u => u.status === "Banned"))}
            className="flex items-center gap-2 bg-white text-gray-500 font-bold text-[10px] px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all uppercase"
          >
            <Download size={14} /> Export Banned Users
          </button>
          <button 
            onClick={() => exportToCSV("active_users.csv", filteredUsers.filter(u => u.status === "Active"))}
            className="flex items-center gap-2 bg-white text-gray-500 font-bold text-[10px] px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all uppercase"
          >
            <Download size={14} /> Export Active Users
          </button>
        </div>
      </div>

      {/* Side Panel & Ban Modal remain unchanged... */}
      {/* (Rest of your existing Aside and Modal code goes here) */}

    </div>
  );
}