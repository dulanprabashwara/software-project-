"use client";
import Link from "next/link";
import { MoreHorizontal, Shield, Activity, Clock, Laptop, ShieldAlert, Monitor } from "lucide-react";

export default function AdminProfilePage() {
  const adminData = {
    name: "Alex Johnson",
    role: "Super Admin",
    email: "alex.johnson@easyblogger.com",
    lastLogin: "Feb 21, 2026, 10:32 AM",
    bio: "Product Designer & Writer. Passionate about UX design, systems, and the future of design creativity. Sharing insights on building better products.",
    stats: { actions: "1.2K", resolved: "892", followers: "2.4K", following: "142" },
    permissions: ["Full Content Moderation", "User Data Access", "System API Management", "Audit Log Review", "AI Model Config"],
    sessions: [
      { device: "Chrome / Windows 11", location: "Colombo, SL", status: "Active Now" },
    ]
  };

  return (
    <div className="flex gap-12 p-8 bg-white max-w-7xl mx-auto">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "serif" }}>{adminData.name}</h1>
          <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={24} /></button>
        </div>

        <div className="flex gap-8 border-b border-gray-100 mb-8 text-sm font-medium">
          <button className="text-black border-b-2 border-black pb-4 font-semibold uppercase tracking-widest text-[11px]">System Governance</button>
        </div>

        <div className="space-y-10">
          <section>
            <p className="text-[#374151] leading-relaxed text-base mb-6">
              {adminData.bio}
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 uppercase">
                <Clock size={12} /> Last Login: {adminData.lastLogin}
              </div>
            </div>
          </section>

          {/* CMS FEATURE: PERMISSION MAPPING (RBAC) */}
          <section className="pt-8 border-t border-gray-50">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert size={14} /> Assigned Administrative Permissions
            </h3>
            <div className="flex flex-wrap gap-2">
              {adminData.permissions.map((perm, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold rounded-lg uppercase">
                  {perm}
                </span>
              ))}
            </div>
          </section>

          <section className="pt-8 border-t border-gray-50">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Account Accountability Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-[#F0FDFA] rounded-3xl border border-[#CCFBF1]">
                <Activity className="text-[#1ABC9C] mb-4" size={24} />
                <h4 className="text-2xl font-black text-gray-900">{adminData.stats.actions}</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase">System Actions Logged</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <Shield className="text-blue-500 mb-4" size={24} />
                <h4 className="text-2xl font-black text-gray-900">{adminData.stats.resolved}</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Content Reports Resolved</p>
              </div>
            </div>
          </section>

          {/* CMS FEATURE: SESSION MANAGEMENT */}
          <section className="pt-8 border-t border-gray-50">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Laptop size={14} /> Active Management Sessions
            </h3>
            {adminData.sessions.map((session, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <Monitor className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{session.device}</p>
                      <p className="text-xs text-gray-400">{session.location} • {session.status}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-red-500 uppercase hover:underline">Revoke Access</button>
               </div>
            ))}
          </section>
        </div>
      </div>

      <div className="w-64 pt-4 sticky top-8 h-fit">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 flex items-center justify-center text-gray-500 text-3xl font-bold shadow-sm">AJ</div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{adminData.name}</h2>
        <div className="text-xs text-gray-500 space-y-1 mb-4">
          <p>{adminData.stats.followers} Followers · {adminData.stats.following} Following</p>
          <p className="font-bold text-[#1ABC9C] uppercase text-[10px] tracking-widest mt-2 flex items-center gap-1"><Shield size={12} /> {adminData.role}</p>
        </div>
        <Link href="/admin/profile/edit" className="text-[#1ABC9C] text-sm font-medium hover:underline block mb-8 text-[13px]">Edit profile</Link>
      </div>
    </div>
  );
}