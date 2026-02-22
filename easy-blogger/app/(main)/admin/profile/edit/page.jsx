"use client";
import { useState } from "react";
import Link from "next/link";
import { Camera, Bell, ShieldCheck, Key, Globe, Smartphone } from "lucide-react";

export default function EditAdminProfile() {
  const [name, setName] = useState("Alex Johnson");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const auditEntry = {
      admin: "Admin User", 
      action: "Updated Profile",
      target: "admin_settings",
      details: `Modified governance bio and updated display name to ${name}`,
      endpoint: "POST /api/admin/profile/update",
    };

    try {
      await fetch('/api/users?action=updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditEntry),
      });
      alert("System security updated and logged in Audit Trail!");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "serif" }}>Edit Profile</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/profile" className="px-6 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500">
            Cancel
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-full bg-[#1ABC9C] text-white text-sm font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* PERSONAL INFORMATION SECTION */}
        <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm flex gap-16">
          <div className="relative h-fit">
            <div className="w-32 h-32 bg-gray-50 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-300 font-bold text-2xl">
              AJ
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-[#1ABC9C] text-white rounded-full border-2 border-white shadow-md">
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-tighter">Admin Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C]" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-tighter">System Email</label>
                <input type="email" defaultValue="alex.johnson@easyblogger.com" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-tighter">Administrative Bio</label>
              <textarea 
                rows={3} 
                defaultValue="Product Designer & Writer. Passionate about UX design, systems, and the future of design creativity. Sharing insights on building better products." 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C] resize-none text-[#374151] leading-relaxed" 
              />
            </div>
          </div>
        </div>

        {/* CMS FEATURE: ADVANCED GOVERNANCE ALERTS */}
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={18} className="text-[#1ABC9C]"/>
            <h3 className="text-lg font-bold">System Governance Alerts</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: "High-Priority Report Notifications", sub: "Get alerted when a post receives > 5 reports", active: true },
              { label: "Critical System Errors", sub: "Email alerts for AI scraper failures", active: true },
              { label: "Audit Log Weekly Export", sub: "Automated CSV summary of system changes", active: false }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={item.active} />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1ABC9C] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* CMS FEATURE: ACCOUNT HARDENING */}
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck size={18} className="text-[#1ABC9C]"/>
            <h3 className="text-lg font-bold">Account Security & Hardening</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-gray-800">IP-Based Access Control</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight text-left">Current IP: 124.43.15.2</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 uppercase tracking-tighter">Lock to IP</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Administrative 2FA</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight text-left">Secured via Google Authenticator</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 uppercase tracking-tighter">Reset Keys</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}