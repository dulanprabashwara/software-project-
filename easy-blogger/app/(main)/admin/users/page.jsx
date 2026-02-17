"use client";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function UserListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    regular: false,
    premium: false,
    banned: false,
    active: false,
  });

  // Mock initial data matching your UI
  const [users, setUsers] = useState([
    { id: "RID0024", name: "Emma Richardson", email: "emma.richardson@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0012", name: "Michael Chen", email: "michael.chen@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0060", name: "Sophia Martinez", email: "sophia.martinez@gmail.com", type: "Regular", status: "Banned" },
    { id: "RID0021", name: "Love Quinn", email: "love.quinn@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0030", name: "John Smith", email: "john.smith@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0005", name: "Alison Dilaurentis", email: "alison.dilaurentis@gmail.com", type: "Regular", status: "Active" },
    { id: "RID0034", name: "Guinevere Beck", email: "guinevere.beck@gmail.com", type: "Regular", status: "Active" },
    { id: "RID0016", name: "David Rose", email: "david.rose@gmail.com", type: "Regular", status: "Banned" }
  ]);

  // Logic: Handle Banning via Toggle Switch
  const handleToggleStatus = (id) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === "Active" ? "Banned" : "Active" };
      }
      return user;
    }));
  };

  const handleFilterChange = (filter) => {
    setActiveFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  // Logic: Filter based on Search and the Status/Type Checkboxes
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const noFiltersSelected = !activeFilters.regular && !activeFilters.premium && !activeFilters.banned && !activeFilters.active;
    if (noFiltersSelected) return matchesSearch;

    const matchesType = (activeFilters.regular && user.type === "Regular") || (activeFilters.premium && user.type === "Premium");
    const matchesStatus = (activeFilters.banned && user.status === "Banned") || (activeFilters.active && user.status === "Active");

    return matchesSearch && (matchesType || matchesStatus);
  });

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-[#111827] ml-4" style={{ fontFamily: "serif" }}>User List</h1>
      
      {/* Container matching Design 1 */}
      <div className="max-w-[1050px] bg-[#D1D5DB]/50 rounded-[45px] overflow-hidden shadow-sm">
        
        {/* Header Filter Bar with Teal Accent */}
        <div className="bg-[#D1D5DB] p-5 px-10 border-b-[3px] border-[#1ABC9C] flex items-center justify-between">
          <div className="flex items-center gap-5 text-[11px] font-bold text-gray-600 uppercase">
             <div className="flex items-center gap-2"><Filter size={16} /> Filter by</div>
             <label className="flex items-center gap-2 cursor-pointer opacity-70">
               <input type="checkbox" className="checkbox checkbox-xs" checked={activeFilters.regular} onChange={() => handleFilterChange('regular')} /> Regular
             </label>
             <label className="flex items-center gap-2 cursor-pointer opacity-70">
               <input type="checkbox" className="checkbox checkbox-xs" checked={activeFilters.premium} onChange={() => handleFilterChange('premium')} /> premium
             </label>
             <label className="flex items-center gap-2 cursor-pointer opacity-70">
               <input type="checkbox" className="checkbox checkbox-xs" checked={activeFilters.banned} onChange={() => handleFilterChange('banned')} /> Banned Users
             </label>
             <label className="flex items-center gap-2 cursor-pointer opacity-70">
               <input type="checkbox" className="checkbox checkbox-xs" checked={activeFilters.active} onChange={() => handleFilterChange('active')} /> Active Users
             </label>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Username or email" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white/80 border-none outline-none text-[10px]" 
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/20 transition-colors">
                  <td className="p-2 pl-16">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                        <span className="text-[10px]">👤</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-[14px]">
                          {user.name}<span className="text-gray-400 font-medium ml-1">[{user.id}]</span>
                        </div>
                        <div className="text-[10px] text-gray-400 italic font-medium -mt-1">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-2 text-center">
                    <span className="font-black text-gray-800 text-[15px] tracking-tighter uppercase">
                      {user.type}
                    </span>
                  </td>

                  <td className="p-2 text-center">
                    {/* Integrated Ban Toggle: Switching Off = Banned */}
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={user.status === "Active"} 
                          onChange={() => handleToggleStatus(user.id)}
                        />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#1ABC9C] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}