"use client";
import { useEffect, useState } from "react";
import { Filter, ChevronDown, Search } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching from your live mock memory
    fetch('/api/users?type=logs')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  // Helper to determine badge colors based on your UI image
  const getBadgeStyle = (action) => {
    const act = action.toLowerCase();
    if (act.includes("banned") || act.includes("deleted")) return "bg-red-100 text-red-600 border border-red-200";
    if (act.includes("unbanned") || act.includes("active")) return "bg-green-100 text-green-600 border border-green-200";
    if (act.includes("reviewed")) return "bg-blue-100 text-blue-600 border border-blue-200";
    if (act.includes("config")) return "bg-gray-100 text-gray-600 border border-gray-200";
    if (act.includes("scrape") || act.includes("trigger")) return "bg-orange-100 text-orange-600 border border-orange-200";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-10 bg-white min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]" style={{ fontFamily: "serif" }}>Audit Logs</h1>
          <p className="text-sm text-gray-500 italic mt-1 font-medium">Read-only history of all administrative actions</p>
        </div>

        {/* FILTERS SECTION */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <Filter size={18} /> Filter by
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <label className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded-full"></div> Admin</label>
            <label className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded-full"></div> Action Type</label>
            <label className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded-full"></div> Date Range Picker</label>
          </div>
          <div className="relative">
             <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-semibold outline-none focus:ring-1 focus:ring-[#1ABC9C]">
               <option>Admin</option>
             </select>
             <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-900 text-lg border-b-2 border-black">
              <th className="pb-4 font-bold text-center w-40">Admin</th>
              <th className="pb-4 font-bold text-center">Action</th>
              <th className="pb-4 font-bold text-center">Target/Details</th>
              <th className="pb-4 font-bold text-center">API Endpoint</th>
              <th className="pb-4 font-bold text-center">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="py-20 text-center text-gray-400 italic">Fetching live logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" className="py-20 text-center text-gray-400 italic">No actions recorded yet. Perform an action in Moderation or User List.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-8 text-center">
                    <div className="text-xl font-black text-gray-800 leading-tight">
                      {log.admin.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-8 text-center">
                    <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold leading-tight w-32 text-center shadow-sm ${getBadgeStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-8 text-center">
                    <div className="font-black text-gray-800 text-lg">{log.target}</div>
                    <div className="text-sm text-gray-500 font-medium mt-1">{log.details}</div>
                  </td>
                  <td className="py-8 text-center">
                    <div className="text-[13px] font-bold text-gray-700 font-mono tracking-tight">{log.endpoint.split(' ')[0]}</div>
                    <div className="text-[13px] font-bold text-gray-500 font-mono tracking-tight">{log.endpoint.split(' ')[1]}</div>
                  </td>
                  <td className="py-8 text-center text-gray-500 font-bold text-sm leading-relaxed whitespace-pre-line">
                    {log.timestamp.replace(' ', '\n')}
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