"use client";
import { useEffect, useState, useCallback } from "react";
import { Filter, ChevronDown, X } from "lucide-react";

import { auth } from "../../../../lib/firebase";
import { api } from "../../../../lib/api";
import Pagination from "../../../../components/admin/Pagination";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);
  const [availableAdmins, setAvailableAdmins] = useState(["All Admins"]);
  const [availableActions, setAvailableActions] = useState(["All Actions"]);

  const [selectedAdmin, setSelectedAdmin] = useState("All Admins");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      let url = `/paginated?page=${page}&limit=${limit}`;
      if (selectedAdmin !== "All Admins") url += `&admin=${encodeURIComponent(selectedAdmin)}`;
      if (selectedAction !== "All Actions") url += `&action=${encodeURIComponent(selectedAction)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.getAuditLogs(url, token);

      const logsArray = Array.isArray(response.data)
        ? response.data
        : (response.data?.data || response.logs || []);

      const mappedLogs = logsArray.map(log => ({
        id: log.id,
        admin: log.admin?.displayName || log.admin?.username || "System Admin",
        action: log.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        target: log.targetId ? `${log.targetType || 'ID'}_${log.targetId.slice(0, 8)}` : "System Action",
        details: log.details || "No additional details",
        endpoint: log.ipAddress ? `IP: ${log.ipAddress}` : "Internal Service",
        rawDate: new Date(log.createdAt),
        timestamp: new Date(log.createdAt).toLocaleString([], {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).replace(', ', '\n')
      }));

      setLogs(mappedLogs);
      setMeta(response.meta);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  },[page, limit, selectedAdmin, selectedAction, startDate, endDate]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async(user) => {
      if (user) {
        const token = await user.getIdToken();
        
        // Fetch the dropdown options ONCE on load
        api.getAuditLogFilters(token).then(res => {
          if (res.success) {
            setAvailableActions(["All Actions", ...res.data.actions]);
            setAvailableAdmins(["All Admins", ...res.data.admins]);
          }
        });

        fetchLogs();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchLogs]);

  // Function to reset page to 1 when a user types a new filter
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1); // Always go back to page 1 when searching
  };

  const getBadgeStyle = (action) => {
    const act = action.toLowerCase();

    // Danger/Destructive (Prioritized to catch "Resolve Report Delete/Ban")
    if (act.includes("delete") || act.includes("ban") || act.includes("revoke") || act.includes("cancel")) {
      return "bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]";
    }
    //Success/Creation (Prioritized to catch "Resolve Report Keep")
    if (act.includes("create") || act.includes("unban") || act.includes("keep")) {
      return "bg-[#DCFCE7] text-[#22C55E] border border-[#86EFAC]";
    }
    //Warning/Manual Actions
    if (act.includes("trigger") || act.includes("lock") || act.includes("reset")) {
      return "bg-[#FEF9C3] text-[#CA8A04] border border-[#FEF08A]";
    }
    //Updates & Modifications
    if (act.includes("update") || act.includes("toggle") || act.includes("resolve")) {
      return "bg-[#DBEAFE] text-[#3B82F6] border border-[#93C5FD]";
    }
    //Default (Exports, Downloads, Logins)
    return "bg-[#F3F4F6] text-[#6B7280] border border-[#D1D5DB]";
  };

  const uniqueAdmins = ["All Admins", ...new Set(logs.map(log => log.admin))];
  const uniqueActions = ["All Actions", ...new Set(logs.map(log => log.action))];

  const filteredLogs = logs.filter(log => {
    const matchAdmin = selectedAdmin === "All Admins" || log.admin === selectedAdmin;
    const matchAction = selectedAction === "All Actions" || log.action === selectedAction;

    let matchDate = true;
    if (startDate || endDate) {
      if (startDate) matchDate = matchDate && log.rawDate >= new Date(startDate);
      if (endDate) matchDate = matchDate && log.rawDate <= new Date(`${endDate}T23:59:59`);
    }

    return matchAdmin && matchAction && matchDate;
  });

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen">
      {/* Header and filters*/}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Audit Logs</h1>
          <p className="text-sm text-gray-500 italic mt-1">Read-only history of all administrative actions</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mr-2">
            <Filter size={18} /> Filter by
          </div>

          {/* Action Type Dropdown */}
          <div className="relative">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-5 py-2.5 pr-10 text-xs font-bold text-gray-600 outline-none shadow-sm cursor-pointer uppercase tracking-widest"
            >
              {availableActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={16} />
          </div>

          {/* Date Range Controls */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Dates:</span>
            <input
              type="date"
              max={endDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs text-gray-600 outline-none bg-transparent font-bold cursor-pointer"
            />
            <span className="text-gray-300">-</span>
            <input
              type="date"
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs text-gray-600 outline-none bg-transparent font-bold cursor-pointer"
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-red-400 hover:text-red-600 ml-1 transition-colors" title="Clear Dates">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Admin Dropdown */}
          <div className="relative">
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-5 py-2.5 pr-12 text-sm font-bold outline-none shadow-sm cursor-pointer"
            >
              {availableAdmins.map(admin => (
                <option key={admin} value={admin}>{admin}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-900 text-xl border-b-2 border-black">
              <th className="pb-5 font-bold text-center w-44">Admin</th>
              <th className="pb-5 font-bold text-center w-44">Action</th>
              <th className="pb-5 font-bold text-center">Target/Details</th>
              <th className="pb-5 font-bold text-center">Source IP</th>
              <th className="pb-5 font-bold text-center w-48">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="py-24 text-center text-gray-400 font-bold italic">Syncing with server...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan="5" className="py-24 text-center text-gray-400 font-bold italic uppercase tracking-widest">No matching logs found</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-6 text-center">
                    <div className="text-lg font-black text-gray-800 leading-tight">
                      {log.admin.split(' ').map((word, i) => (<span key={i} className="block">{word}</span>))}
                    </div>
                  </td>
                  <td className="py-6 text-center">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getBadgeStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-6 text-center">
                    <div className="font-black text-gray-800 text-base">{log.target}</div>
                    <div className="text-xs text-gray-400 font-bold mt-1 px-4 line-clamp-2">{log.details}</div>
                  </td>
                  <td className="py-6 text-center font-mono text-sm font-bold">
                    <div className="text-gray-800">{log.endpoint.split(' ')[0]}</div>
                    <div className="text-gray-400 text-xs">{log.endpoint.split(' ')[1] || ''}</div>
                  </td>
                  <td className="py-6 text-center text-gray-500 font-bold text-sm whitespace-pre-line leading-relaxed">
                    {log.timestamp}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {meta && !loading && logs.length > 0 && (
        <div className="mt-8">
          <Pagination 
            currentPage={page}
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            itemsPerPage={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}