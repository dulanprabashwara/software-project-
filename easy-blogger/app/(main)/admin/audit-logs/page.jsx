"use client";
import { useEffect, useState } from "react";
import { Filter, ChevronDown } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState("Admin"); // Track dropdown state

  // RE-FETCH ON FILTER CHANGE
  useEffect(() => {
    setLoading(true);
    const url = selectedAdmin !== "Admin" 
      ? `/api/users?type=logs&admin=${selectedAdmin}` 
      : `/api/users?type=logs`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, [selectedAdmin]);

  const getBadgeStyle = (action) => {
    const act = action.toLowerCase();
    if (act.includes("banned") || act.includes("deleted")) return "bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]";
    if (act.includes("unbanned") || act.includes("active")) return "bg-[#DCFCE7] text-[#22C55E] border border-[#86EFAC]";
    if (act.includes("reviewed")) return "bg-[#DBEAFE] text-[#3B82F6] border border-[#93C5FD]";
    return "bg-[#F3F4F6] text-[#6B7280] border border-[#D1D5DB]";
  };

  return (
    <div className="p-10 bg-white min-h-screen">
      {/* HEADER & FILTERS */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Audit Logs</h1>
          <p className="text-sm text-gray-500 italic mt-1">Read-only history of all administrative actions</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <Filter size={18} /> Filter by
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <label className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div> Admin</label>
            <label className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div> Action Type</label>
            <label className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div> Date Range Picker</label>
          </div>
          
          {/* FUNCTIONAL DROPDOWN */}
          <div className="relative">
             <select 
               value={selectedAdmin}
               onChange={(e) => setSelectedAdmin(e.target.value)}
               className="appearance-none bg-white border border-gray-200 rounded-xl px-5 py-2.5 pr-12 text-sm font-bold outline-none shadow-sm cursor-pointer"
             >
               <option value="Admin">Admin</option>
               <option value="Admin Sarah">Admin Sarah</option>
               <option value="Admin Mike">Admin Mike</option>
               <option value="Admin Dulsi">Admin Dulsi</option>
             </select>
             <ChevronDown className="absolute right-4 top-3 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-12 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-900 text-xl border-b-2 border-black">
              <th className="pb-5 font-bold text-center w-44">Admin</th>
              <th className="pb-5 font-bold text-center w-44">Action</th>
              <th className="pb-5 font-bold text-center">Target/Details</th>
              <th className="pb-5 font-bold text-center">API Endpoint</th>
              <th className="pb-5 font-bold text-center w-48">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="py-24 text-center text-gray-400 font-bold italic">Syncing with server...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" className="py-24 text-center text-gray-400 font-bold italic uppercase tracking-widest">No matching logs found</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-10 text-center">
                    <div className="text-xl font-black text-gray-800 leading-[1.1]">
                      {log.admin.split(' ').map((word, i) => (<span key={i} className="block">{word}</span>))}
                    </div>
                  </td>
                  <td className="py-10 text-center">
                    <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold shadow-sm ${getBadgeStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-10 text-center">
                    <div className="font-black text-gray-800 text-[18px]">{log.target}</div>
                    <div className="text-sm text-gray-400 font-bold mt-1 px-4 line-clamp-2">{log.details}</div>
                  </td>
                  <td className="py-10 text-center font-mono text-[13px] font-bold">
                    <div className="text-gray-800">{log.endpoint.split(' ')[0]}</div>
                    <div className="text-gray-400">{log.endpoint.split(' ')[1]}</div>
                  </td>
                  <td className="py-10 text-center text-gray-500 font-bold text-sm whitespace-pre-line leading-relaxed">
                    {log.timestamp.replace(', ', '\n')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}